import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {ScanService} from '@app/services/scan.service';
import {combineLatest, Observable, Subject} from 'rxjs';
import {AssetInScan, ScanFrontend} from '@app/lib/scan/interfaces';
import {ActivatedRoute, Router} from '@angular/router';
import {Coin} from '@app/lib/coin/interfaces';
import {CoinService} from '@app/services/coin.service';
import {
    catchError,
    debounceTime,
    distinctUntilChanged,
    filter,
    map,
    shareReplay,
    startWith,
    switchMap,
    take
} from 'rxjs/operators';
import {handleError} from '@app/lib/util/error';
import {sortElements} from '@app/lib/coin/sort';
import {Location} from '@angular/common';
import {DialogConfirmationComponent} from '@shared_comp/dialog-confirm/dialog-confirmation.component';
import {dialogWidth, updateOnDialogClose} from '@app/lib/util/dialog';
import {MatDialog} from '@angular/material/dialog';
import {MatSnackBar} from '@angular/material/snack-bar';
import {UserRoleService} from '@app/services/user-role.service';
import {filterCoinIdsByTerm} from '@app/lib/filter/filter-coins';
import {materialIcons} from '@app/lib/global/icons';
import {areObjectsEqual} from '@shared_library/functions/general/object';
import {debounceTimeInputMs} from '@app/lib/global/debounce-on-user-input';
import {AssetIdCoin, MetricCoinSnapshot} from '@shared_library/asset/assets/coin/interfaces';
import {AssetId} from '@shared_library/datatypes/data';
import {areArraysEqual, getElementsWhichAreOnlyInFirstArray} from '@shared_library/functions/general/array';
import {ScanNotification} from '@shared_library/scan/interfaces';
import {AssetType} from '@shared_library/asset/interfaces-asset';
import {onlyFirstEmitWillPass} from '@lib/rxjs/only-first-emit-will-pass';
import {UserLastSelectionService} from '@app/services/user-last-selection.service';
import {RouteInfoService} from '@app/services/route-info.service';
import {SortRequestScanContent} from '@pages_scans/scan-content/interfaces';
import {syncNotificationWithResult} from "@lib/scan/sync-notification";


@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-scan-content',
    templateUrl: './scan-content.component.html',
    styleUrls: ['./scan-content.component.scss']
})
export class ScanContentComponent implements OnInit {
    scan$: Observable<ScanFrontend>;
    assets$: Observable<AssetInScan[]>;
    sortReq$: Observable<SortRequestScanContent>;
    isSearchDialogActive = false;
    readonly icons = materialIcons;
    readonly labelsSort: MetricCoinSnapshot[] = ['rank', 'price', 'delta'];
    private readonly lastSelection = this.userLastSelection.screenScanContent;
    private readonly searchBarSubject = new Subject<string>();
    private readonly sortRequestSubject = new Subject<SortRequestScanContent>();

    constructor(private route: ActivatedRoute, private  scanService: ScanService, private coinService: CoinService,
                private location: Location, private router: Router, public dialog: MatDialog,
                private snackBar: MatSnackBar, private role: UserRoleService,
                private userLastSelection: UserLastSelectionService, private routeInfo: RouteInfoService) {
    }

    ngOnInit() {
        this.scan$ = this.getScan$();
        this.sortReq$ = this.getSortRequest$();
        const searchTerm$ = this.getSearchTerm$();
        this.assets$ = this.getAssets$(this.scan$, this.sortReq$, searchTerm$);
    }

    onClickAtAppBar(element: string) {
        switch (element) {
            case this.icons.back:
                this.updateLastSeenIds();
                this.router.navigate(['../../'], {relativeTo: this.route});
                break;

            case this.icons.search:
                this.isSearchDialogActive = true;
                break;

            case this.icons.delete:
                this.openDialogDelete();
                break;
        }
    }

    closeSearchBar() {
        this.isSearchDialogActive = false;
    }

    goToAssetDetail(coinId: AssetIdCoin) {
        this.scan$.pipe(
          take(1),
          map(scan => scan.id),
          map(id => this.router.navigate([`../../detail/${coinId}/${id}`], {relativeTo: this.route}))
        ).subscribe();
    }

    onClickAtSortLabel(sortReq: SortRequestScanContent) {
        this.sortRequestSubject.next(sortReq);
        this.lastSelection.lastSortRequest = sortReq;
    }

    goToModifyScan() {
        this.scan$.pipe(
            take(1),
            map(scan => scan.id)
        ).subscribe(id => this.router.navigate([`../../build/${id}`], {relativeTo: this.route}));
    }

    updateSearch(term: string) {
        this.searchBarSubject.next(term);
    }


    // private

    private getScanId$(): Observable<number> {
        return this.route.paramMap.pipe(
            map(params => parseInt(params.get('id'), 10)),
            distinctUntilChanged());
    }


    private getScan$(): Observable<ScanFrontend> {
        return this.getScanId$().pipe(
            switchMap(id => this.scanService.getScan$(id)),
            shareReplay(1));
    }

    private getSearchTerm$(): Observable<string> {
        return this.searchBarSubject.asObservable().pipe(
            debounceTime(debounceTimeInputMs),
            startWith(''),
            distinctUntilChanged(),
            shareReplay(1)
        );
    }
    private getSortRequest$(): Observable<any> {
        const initSortRequest = this.getInitialSortRequest(this.lastSelection.lastSortRequest);
        return this.sortRequestSubject.asObservable().pipe(
            debounceTime(debounceTimeInputMs),
            startWith(initSortRequest),
            distinctUntilChanged((obj1: object, obj2: object) => areObjectsEqual(obj1, obj2)),
            shareReplay(1)
        );
    }

    private getAssets$(scan$: Observable<ScanFrontend>, sortRequest$: Observable<SortRequestScanContent>,
                      searchTerm$: Observable<string>): Observable<AssetInScan[]> {
        const pureAssets$ = this.coinService.coins$;
        let assets$: Observable<AssetInScan[]>;
        assets$ = this.processAssetsByScanRelation(pureAssets$, scan$);
        assets$ = this.sortAssets(assets$, sortRequest$);
        return this.filterAssetsBySearchTerm(assets$, searchTerm$);
    }

    private getInitialSortRequest(lastSortRequest: SortRequestScanContent): SortRequestScanContent {
        if (this.wasMainMenuLastPage()) {
            return {...lastSortRequest, forceNewIdsFirst: true};
        } else {
            return {...lastSortRequest};
        }
    }

    private wasMainMenuLastPage(): boolean {
        return this.routeInfo.previousUrl.endsWith('menu');
    }

    private processAssetsByScanRelation(coins$: Observable<Coin[]>, scan$: Observable<ScanFrontend>): Observable<AssetInScan[]> {
        return combineLatest(coins$, scan$).pipe(
            map(([coins, scan]) => {
                const lookup = this.createLookupCoinTable(coins);
                const newIds = this.getIdsWhichAreNewInScan(scan.notification, scan.result);
                const filtered = scan.result.filter(id => lookup[id] !== undefined); // if result contains unused coins
                return filtered.map(id => this.mapId2AssetInScan(id, newIds, lookup));
            })
        );
    }

    private sortAssets(coins$: Observable<AssetInScan[]>, sort$: Observable<SortRequestScanContent>): Observable<AssetInScan[]> {
        return combineLatest(coins$, sort$).pipe(
            map(([coins, sort]) => this.sortAssetsBy(coins, sort))
        );
    }

    private filterAssetsBySearchTerm(coins$: Observable<AssetInScan[]>, search$: Observable<string>): Observable<AssetInScan[]> {
        return combineLatest(coins$, search$).pipe(
            map(([coins, search]) => {
                const ids = coins.map(coin => coin.id);
                const filtered = filterCoinIdsByTerm(ids, search);
                return coins.filter(coin => filtered.includes(coin.id));
            }),
            catchError(handleError<AssetInScan[]>('getAssets$', [])),
        );
    }

    private getIdsWhichAreNewInScan<T extends AssetType>(notification: ScanNotification<T>, currentIds: AssetId<T>[]): AssetId<T>[] {
        return getElementsWhichAreOnlyInFirstArray(currentIds, notification.lastSeen);
    }

    private createLookupCoinTable(coins: Coin[]): any {
        const lookup: any = {};
        coins.forEach(coin => {
            lookup[coin.id] = coin;
        });
        return lookup;
    }

    private mapId2AssetInScan(id: AssetId<any>, newIds: AssetId<any>[], lookupAsset: any): AssetInScan {
        const asset: AssetInScan = {...lookupAsset[id], relationToScan: 'old'};
        if (newIds.includes(id)) {
            asset.relationToScan = 'new';
        }
        return asset;
    }

    private sortAssetsBy<T extends AssetInScan>(assets: T[], sortRequest: SortRequestScanContent): T[] {
        const accessorFunc = (c: T) => c.snapshot[sortRequest.metric];
        assets = sortElements(assets, accessorFunc, sortRequest.ascending);
        if (sortRequest.forceNewIdsFirst) {
            assets = this.putNewAssetsFirst(assets);
        }
        return assets;
    }

    private putNewAssetsFirst<T extends AssetInScan>(assets: T[]): T[] {
        const newAssets = assets.filter(asset => asset.relationToScan === 'new');
        const oldAssets = assets.filter(asset => asset.relationToScan === 'old');
        return [...newAssets, ...oldAssets];
    }

    private openDialogDelete(): void {
        const dialog = 'Are you sure you want to delete the current filter ?\nThis action cannot be undone.';
        const dialogRef = this.dialog.open(DialogConfirmationComponent, {width: dialogWidth, data: {dialog: dialog}});
        const deleteWrapper = (doDelete: boolean) => this.deleteScanIfPermitted(doDelete);
        updateOnDialogClose<boolean>(dialogRef, deleteWrapper);
    }

    private deleteScanIfPermitted(doDelete: boolean): void {
        const permission$ = this.role.getPermissionCheck$('deleteScan').pipe(take(1));
        if (doDelete) {
            permission$.subscribe(permission => {
                if (permission.isPermitted) {
                    this.deleteScan();
                    this.location.back();
                } else {
                    this.showReasonInSnackbar(permission.reason);
                }
            });
        }
    }

    private deleteScan() {
        this.scan$.pipe(
            onlyFirstEmitWillPass(),
            map(scan => scan.id),
            switchMap(id => this.scanService.deleteScan$(id))
        ).subscribe(result => console.log('Delete filter ', result));
    }

    private showReasonInSnackbar(msg: string): void {
        this.snackBar.open(msg, 'Ok', {
            duration: 5000,
        });
    }

    private updateLastSeenIds(): void {
        this.scan$.pipe(
            onlyFirstEmitWillPass(),
            filter(scan => ! areArraysEqual(scan.notification.lastSeen, scan.result)),
            map(scan => syncNotificationWithResult(scan)),
            switchMap(scan => this.scanService.updateScan(scan))
        ).subscribe();
    }
}
