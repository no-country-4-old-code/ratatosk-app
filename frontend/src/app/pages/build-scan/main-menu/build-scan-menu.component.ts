import {ChangeDetectionStrategy, Component, OnInit, TemplateRef} from '@angular/core';
import {BuildService} from '@app/services/build.service';
import {
    DialogCopyFromScanComponent
} from '@app/pages/build-scan/_components/dialog-copy-from-scan/dialog-copy-from-scan.component';
import {MatDialog} from '@angular/material/dialog';
import {FormControl} from '@angular/forms';
import {combineLatest, Observable} from 'rxjs';
import {debounceTime, distinctUntilChanged, filter, map, switchMap, take, tap} from 'rxjs/operators';
import {ScanFrontend} from '@app/lib/scan/interfaces';
import {UserRoleService} from '@app/services/user-role.service';
import {DialogConfirmationComponent} from '@shared_comp/dialog-confirm/dialog-confirmation.component';
import {lookupCoinInfo} from '../../../../../../shared-library/src/asset/assets/coin/helper/lookup-coin-info-basic';
import {RestrictedAction} from '@app/lib/user-role/permission-check/interfaces';
import {ActivatedRoute, Router} from '@angular/router';
import {RouteInfoService} from '@app/services/route-info.service';
import {dialogWidth, updateOnDialogClose} from '@app/lib/util/dialog';
import {OnDestroyMixin} from '@app/lib/components/mixin-on-destroy';
import {debounceTimeFixRace} from '@app/lib/global/debounce-on-user-input';
import {areObjectsEqual} from '../../../../../../shared-library/src/functions/general/object';
import {BuildCategory} from '@app/lib/build/plausibility-checks';
import {materialIcons} from '@app/lib/global/icons';
import {DialogIconComponent} from '@app/pages/build-scan/_components/dialog-icon/dialog-icon.component';
import {ContentCategory} from '@app/pages/build-scan/_components/card-category/category-card.component';
import {areArraysEqual} from '../../../../../../shared-library/src/functions/general/array';
import {Location} from '@angular/common';
import {assetCoin} from '../../../../../../shared-library/src/asset/lookup-asset-factory';
import {AssetIdCoin} from '../../../../../../shared-library/src/asset/assets/coin/interfaces';
import {ConditionBlueprint} from '../../../../../../shared-library/src/scan/condition/interfaces';
import {openDialogLoading} from '@shared_comp/dialog-loading/dialog-loading.component';
import {UserService} from '@app/services/user.service';
import {UserData} from '@shared_library/datatypes/user';
import {onlyFirstEmitWillPass} from '@lib/rxjs/only-first-emit-will-pass';
import {mapPreselection2Ids} from '@shared_library/functions/map-preselection-2-ids';
import {isPro} from '@shared_library/functions/is-pro';
import {BuildConditionService} from "@app/services/build-condition.service";
import {DialogInfoComponent, DialogInfoData} from "@shared_comp/dialog-info/dialog-info.component";

// TODO: Later on add e2e test if scans are correctly load !

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-build-view',
    templateUrl: './build-scan-menu.component.html',
    styleUrls: ['./build-scan-menu.component.scss']
})
export class BuildScanMenuComponent extends OnDestroyMixin implements OnInit {
    readonly pageTitle = 'Build Filter';
    readonly titleControl = new FormControl();
    readonly notifyControl = new FormControl();
    readonly errorMsgAll$: Observable<string[]>;
    readonly isScanInvalid$: Observable<boolean>;
    readonly isPro$: Observable<boolean>;
    readonly contentIcon$: Observable<string>;
    readonly contentPreselection$: Observable<ContentCategory>;
    readonly contentConditions$: Observable<ContentCategory>;
    readonly contentNotify$: Observable<ContentCategory>;
    readonly icons = materialIcons;
    private readonly errHint = 'here is an error';

    constructor(public build: BuildService, public dialog: MatDialog, private location: Location, private route: ActivatedRoute,
                private router: Router, private routeInfo: RouteInfoService, role: UserRoleService, user: UserService,
                private buildCondition: BuildConditionService) {
        super();
        this.errorMsgAll$ = this.getErrorMsgAll$(build, role);
        this.isScanInvalid$ = this.getScanInvalid$(this.errorMsgAll$);
        this.isPro$ = this.getIsPro$(user.user$);
        this.contentIcon$ = this.getContentIcon$();
        this.contentPreselection$ = this.getContentPreselection$();
        this.contentConditions$ = this.getContentConditions$();
        this.contentNotify$ = this.getContentNotify$();
    }

    ngOnInit() {
        this.initTitleUpdate$();
        this.initNotifyUpdate$();
        const isVisitFromExtern = ! (this.wasConditionLastPage() || this.wasPreselectionLastPage());
        if (isVisitFromExtern) {
            this.loadScanSettings();
        }
    }

    onClickAtAppBar(element: string) {
        if (element === this.icons.clear) {
            this.clearAndReturn();
        }
    }

    onClickAtFab() {
        this.saveAndReturn();
    }

    openConditions(): void {
        this.buildCondition.reset();
        this.router.navigate(['conditions'], {relativeTo: this.route});
    }

    openPreselection(): void {
        this.router.navigate(['preselection'], {relativeTo: this.route});
    }

    openDialogPreselectionCopy(): void {
        this.openDialogCopyFromScan(
            (view: ScanFrontend) => this.mapCoinIds2String( mapPreselection2Ids(view.preSelection, view.asset) ),
            (view: ScanFrontend) => {
                this.build.update({preSelection: view.preSelection});
            });
    }

    openDialogConditionsCopy(): void {
        this.openDialogCopyFromScan(
            (view: ScanFrontend) => this.mapConditions2String(view.conditions),
            (view: ScanFrontend) => {
                this.build.update({conditions: view.conditions});
            });
    }

    openDialogNotifyInfo(template: TemplateRef<any>): void {
        const data: DialogInfoData = {template};
        const dialogRef = this.dialog.open(DialogInfoComponent, {width: dialogWidth, data});
        updateOnDialogClose<boolean>(dialogRef, () => {});
    }

    openDialogIcon(): void {
        const dialogRef = this.dialog.open(DialogIconComponent, {width: dialogWidth});
        const update = (iconId: number) => this.build.update({iconId});
        updateOnDialogClose<number>(dialogRef, update);
    }


    // private


    private initTitleUpdate$(): void {
        this.build.currentBlueprint$.pipe(
            this.takeUntilDestroyed(),
            map((view: ScanFrontend) => view.title),
            filter(title => title !== this.titleControl.value)
        ).subscribe(title => this.titleControl.setValue(title));

        this.titleControl.valueChanges.pipe(
            this.takeUntilDestroyed(),
            tap(title => this.build.update({title}))
        ).subscribe();
    }

    private initNotifyUpdate$(): void {
        this.build.currentBlueprint$.pipe(
            this.takeUntilDestroyed(),
            map((view: ScanFrontend) => view.notification.isEnabled),
            filter(value => value !== this.notifyControl.value)
        ).subscribe(value => this.notifyControl.setValue(value));

        this.notifyControl.valueChanges.pipe(
            this.takeUntilDestroyed(),
            switchMap(isEnabled => this.build.currentBlueprint$.pipe(
                take(1),
                map(condition => ({...condition.notification})),
                map(notification => ({...notification, isEnabled: isEnabled})),
            ))
        ).subscribe(notification => this.build.update({notification}));
    }

    private wasConditionLastPage(): boolean {
        return this.routeInfo.previousUrl.includes('conditions');
    }

    private wasPreselectionLastPage(): boolean {
        return this.routeInfo.previousUrl.includes('preselection');
    }

    private loadScanSettings(): void {
        this.getScanId$().pipe(
            take(1)
        ).subscribe(id => this.build.load(id));
    }

    private saveAndReturn(): void {
        const save$ = this.getScanId$().pipe(
            onlyFirstEmitWillPass(),
            switchMap(id => (isNaN(id)) ? this.build.save() : this.build.save(id)));

        const callbackAfterLoad = (updatedScanIdx: number) => {
            this.build.reset();
            this.router.navigate([`result/${updatedScanIdx}`], {relativeTo: this.route.parent.parent.parent});
        };

        openDialogLoading(save$, this.dialog, callbackAfterLoad);
    }

    private clearAndReturn(): void {
        const doReset = () => {
            this.build.reset();
            this.location.back();
        };
        if (this.build.hasChanged()) {
            this.openDialogReset(doReset);
        } else {
            this.location.back();
        }
    }

    private openDialogReset(doReset: () => void): void {
        const dialog = 'Are you sure you want to return and discard all your changes ?';
        const dialogRef = this.dialog.open(DialogConfirmationComponent, {width: dialogWidth, data: {dialog: dialog}});
        const update = (isConfirmed: boolean) => {
            if (isConfirmed) {
                doReset();
            }
        };
        updateOnDialogClose<boolean>(dialogRef, update);
    }

    private openDialogCopyFromScan(extractInfo: (view: ScanFrontend) => string, update: (view: ScanFrontend) => void) {
        const dialogRef = this.dialog.open(DialogCopyFromScanComponent, {width: dialogWidth, data: {extractInfo}});
        updateOnDialogClose<ScanFrontend>(dialogRef, update);
    }

    private getScanId$(): Observable<number> {
        return this.route.paramMap.pipe(map(params => parseInt(params.get('id'), 10)));
    }

    private getErrorMsgAll$(build: BuildService, role: UserRoleService): Observable<string[]> {
        const permission$ = this.getPermission$(role);
        const errorBuild$ = build.errorBuild$.pipe(map(errors => errors.map(err => err.msg)));
        return combineLatest(errorBuild$, permission$).pipe(
            map(([errors, permission]): string[] => {
                return permission.isPermitted ? [...errors] : [...errors, permission.reason];
            }),
            distinctUntilChanged((oldArray, newArray) => areArraysEqual(oldArray, newArray))
        );
    }

    private getPermission$(role: UserRoleService) {
        return this.getScanId$().pipe(
            map(id => isNaN(id) ? 'addScan' : 'modifyScan'),
            switchMap((action: RestrictedAction) => role.getPermissionCheck$(action))
        );
    }

    private getScanInvalid$(errorMsgAll$: Observable<string[]>) {
        return errorMsgAll$.pipe(
            map(msg => msg.length > 0),
            distinctUntilChanged());
    }

    private getIsPro$(user$: Observable<UserData>): Observable<boolean> {
        return user$.pipe(
            map(user => isPro(user)),
            distinctUntilChanged());
    }

    private getContentIcon$(): Observable<string> {
        return this.build.currentBlueprint$.pipe(
            map(view => view.iconPath),
            distinctUntilChanged()
        );
    }

    private getContentPreselection$(): Observable<ContentCategory> {
        const info$ = this.getPreselectionInfo$();
        return this.getContent$(info$, 'Preselection');
    }

    private getContentConditions$(): Observable<ContentCategory> {
        const info$ = this.getConditionsInfo$();
        return this.getContent$(info$, 'Conditions');
    }

    private getContentNotify$(): Observable<ContentCategory> {
        const info$ = this.getNotifyInfo$();
        return this.getContent$(info$, 'Notification');
    }

    private getContent$(info$: Observable<string>, category: BuildCategory): Observable<ContentCategory> {
        const isValid$ = this.getIsValid$(category);
        return combineLatest(info$, isValid$).pipe(
            debounceTime(debounceTimeFixRace),
            map(([info, isValid]) => this.createCategoryStatus(info, isValid)),
            distinctUntilChanged((obj1, obj2) => areObjectsEqual(obj1, obj2)),
        );
    }

    private getPreselectionInfo$(): Observable<string> {
        return this.build.currentBlueprint$.pipe(
            map(scan =>  mapPreselection2Ids(scan.preSelection, scan.asset)),
            map(ids => this.mapCoinIds2String(ids))
        );
    }

    private getConditionsInfo$(): Observable<string> {
        return this.build.currentBlueprint$.pipe(
            map(view => this.mapConditions2String(view.conditions)));
    }

    private getNotifyInfo$(): Observable<string> {
        return this.build.currentBlueprint$.pipe(
            map(view => this.mapNotify2String(view.notification.isEnabled)),
            distinctUntilChanged());
    }

    private getIsValid$(category: BuildCategory): Observable<boolean> {
        return this.build.errorBuild$.pipe(
            map(errors => errors.filter(err => err.category === category)),
            map(msg => msg.length === 0),
        );
    }

    private createCategoryStatus(info: string, isValid: boolean): ContentCategory {
        return isValid ? {isValid, info} : {isValid, info: this.errHint};
    }

    private mapCoinIds2String(ids: AssetIdCoin[]): string {
        const maxNumberDisplayedCoinsNames = 4;
        let msg: string;
        if (ids.length === assetCoin.getIds().length) {
            msg = 'all coins';
        } else if (ids.length > maxNumberDisplayedCoinsNames) {
            msg = `${ids.length} coins (${this.listCoins(ids.slice(0, maxNumberDisplayedCoinsNames))}...)`;
        } else {
            msg = this.listCoins(ids);
        }
        return msg;
    }

    private mapConditions2String(conditions: ConditionBlueprint<'coin'>[]): string {
        const attr = conditions.map(cond => cond.metric).join(', ');
        let msg = 'no conditions';
        if (conditions.length === 1) {
            msg = `${conditions.length} condition (${attr})`;
        } else if (conditions.length > 1) {
            msg = `${conditions.length} conditions (${attr})`;
        }
        return msg;
    }

    private mapNotify2String(isEnabled: boolean): string {
        return isEnabled ? 'new coin detected' : 'never';
    }

    private listCoins(coinIds: AssetIdCoin[]): string {
        return coinIds.map(id => lookupCoinInfo[id].symbol).join(', ');
    }
}
