import {ChangeDetectionStrategy, Component} from '@angular/core';
import {ScanService} from '@app/services/scan.service';
import {ActivatedRoute, Router} from '@angular/router';
import {materialIcons} from '@app/lib/global/icons';
import {combineLatest, Observable, of} from 'rxjs';
import {map, switchMap} from 'rxjs/operators';
import {ScanFrontend} from '@lib/scan/interfaces';
import {Scan} from '@shared_library/scan/interfaces';
import {AreScansSynchronizedService} from '@app/services/are-scans-synchronized.service';
import {mapPreselection2Ids} from '@shared_library/functions/map-preselection-2-ids';
import {UserRoleService} from "@app/services/user-role.service";
import {UserRole} from "@lib/user-role/permission-check/interfaces";
import {syncScansWithoutUnseenAssets} from "@lib/scan/sync-notification";
import {deepCopy} from "@shared_library/functions/general/object";
import {areArraysEqual} from "@shared_library/functions/general/array";
import {onlyFirstEmitWillPass} from "@lib/rxjs/only-first-emit-will-pass";

interface ScanInfo {
    title: string;
    iconPath: string;
    callback: () => void;
    subtext: string;
    numberOfNewAndUnseenAssets: number;
}

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-display-all-scans',
    templateUrl: './all-scans.component.html',
    styleUrls: ['./all-scans.component.scss']
})
export class AllScansComponent {
    readonly iconAdd = materialIcons.add;
    readonly scanInfos$: Observable<ScanInfo[]>;

    constructor(public scanService: ScanService, private router: Router, private activeRoute: ActivatedRoute,
                private areScansSync: AreScansSynchronizedService, public role: UserRoleService) {
        this.scanInfos$ = this.getScanInfos$();
        this.syncronizeScans();

    }

    navigateToBuildScan() {
        this.router.navigate(['build/new'], {relativeTo: this.activeRoute});
    }

    // private

    private getScanInfos$(): Observable<ScanInfo[]> {
        return combineLatest(this.scanService.scans$, this.areScansSync.areScansSynchronized$).pipe(
            map(([scans, isSync]) => this.mapScans2Infos(scans, isSync))
        );
    }

    private mapScans2Infos(scans: ScanFrontend[], isSync: boolean): ScanInfo[] {
        return scans.map(scan => this.mapScanToInfo(scan, isSync));
    }

    private mapScanToInfo(scan: ScanFrontend, isSync: boolean): ScanInfo {
        return {
            title: scan.title,
            iconPath: scan.iconPath,
            subtext: this.createSubtext(scan, isSync),
            numberOfNewAndUnseenAssets: scan.numberOfNewAndUnseenAssets,
            callback: () => this.navigateToScan(scan.id),
        };
    }

    private createSubtext(scan: Scan, isSync: boolean): string {
        const result = this.getResultSymbol(scan, isSync);
        const ids = mapPreselection2Ids(scan.preSelection, scan.asset);
        return `${result} / ${ids.length}`;
    }

    private navigateToScan(id: number) {
        this.router.navigate([`result/${id}`], {relativeTo: this.activeRoute});
    }

    private getResultSymbol(scan: Scan, isSync: boolean): string {
        let result = '?';
        if (scan.timestampResultData !== 0 && isSync) {
            result = `${scan.result.length}`;
        }
        return result;
    }

    private syncronizeScans(): void {
        combineLatest(this.scanService.scans$, this.role.role$).pipe(
                onlyFirstEmitWillPass(),
                switchMap(([scans, role]) => this.handleSyncScansForPro(scans, role))
            ).subscribe();
    }

    private handleSyncScansForPro(scans: ScanFrontend[], role: UserRole): Observable<boolean> {
        let result$ = of(false);
        console.log('Go into sync - 1', scans, role);

        if (this.isPro(role)) {
            const lastSeenOld = deepCopy(scans.map(scan => scan.notification.lastSeen));
            scans = syncScansWithoutUnseenAssets(scans);
            const lastSeenNew = scans.map(scan => scan.notification.lastSeen);
            console.log('Go into sync - 2 (Pro)', scans);

            if (! areArraysEqual(lastSeenNew, lastSeenOld)) {
                result$ = this.scanService.updateScans(scans);
                console.log('Go write new synced - 3 (Write)', lastSeenNew, lastSeenOld);
            } else {
                console.log('Cancel write new synced - ', lastSeenNew, lastSeenOld);
            }
        }
        return result$;
    }

    private isPro(role: UserRole): boolean {
        const rolePro: UserRole = 'pro';
        return role === rolePro;
    }
}
