import {Injectable} from '@angular/core';
import {combineLatest, Observable, of, Subject} from 'rxjs';
import {mapScan2Frontend} from '@app/lib/firestore/mapFirestore';
import {areObjectsEqual} from '../../../../shared-library/src/functions/general/object';
import {mapToClone} from '@app/lib/rxjs/map-to-clone';
import {BuildError, runPlausibilityChecks} from '@app/lib/build/plausibility-checks';
import {
    delay,
    distinctUntilChanged,
    map,
    mapTo,
    retry,
    shareReplay,
    startWith,
    switchMap,
    take,
    tap
} from 'rxjs/operators';
import {ScanFrontend} from '@app/lib/scan/interfaces';
import {Scan} from '../../../../shared-library/src/scan/interfaces';
import {areArraysEqual} from '../../../../shared-library/src/functions/general/array';
import {lookupAssetFactory} from '../../../../shared-library/src/asset/lookup-asset-factory';
import {ScanService} from '@app/services/scan.service';
import {triggerAsyncScanCalculation} from '@lib/backend-api/trigger-async-scan';
import {AuthService} from '@app/services/auth.service';
import {HttpClient} from '@angular/common/http';
import {onlyFirstEmitWillPass} from '@lib/rxjs/only-first-emit-will-pass';
import {getRandomScanIconId} from '@lib/scan/lookup-icons';
import {ResponseRunAsyncScan} from "@shared_library/backend-interface/cloud-functions/interfaces";


@Injectable({
	providedIn: 'root'
})
export class BuildService {
	readonly currentBlueprint$: Observable<ScanFrontend>;
	readonly errorBuild$: Observable<BuildError[]>;
	private readonly delayAfterTriggerAsyncMs = 500;
	private readonly buildSubject: Subject<ScanFrontend> = new Subject<ScanFrontend>();
	private currentBlueprintSnapshot: ScanFrontend;
	private unmodifiedBlueprint: ScanFrontend;

	constructor(private scanService: ScanService, private auth: AuthService, private http: HttpClient) {
		this.unmodifiedBlueprint = this.createDefaultScanBlueprint();
		this.currentBlueprint$ = this.getCurrentBlueprint$();
		this.errorBuild$ = this.getBuildError$();
	}

	reset(): void {
		this.loadBlueprint(this.createDefaultScanBlueprint());
	}

	load(id): void {
		this.copyExistingOrCreateNew(id).pipe(
			take(1),
			tap(scan => {if(scan === undefined) {console.error('Try to load non-existing scan with id', id)}})
		).subscribe(scan => this.loadBlueprint(scan));
	}

	update(updatedAttr: Partial<Scan>): void {
		this.currentBlueprint$.pipe(
			take(1),
			map(blueprint => ({...blueprint, ...updatedAttr})),
			map(blueprint => mapScan2Frontend(blueprint)), // updates icon id and icon path
		).subscribe(blueprint => this.buildSubject.next(blueprint));
	}

	save(overwrittenId?: number): Observable<number> {
		const snapshotUnderConstruction$ = this.currentBlueprint$;
		return combineLatest(this.scanService.scans$, snapshotUnderConstruction$).pipe(
			onlyFirstEmitWillPass(),
			switchMap(([scans, blueprint]) => {
				const updatedBlueprint = {...blueprint, id: this.getId(scans, overwrittenId)};
				let promiseTriggerAsync = () =>  of(true);
				if (this.hasChangedInPreselectionOrConditions(blueprint) || this.hasNeverBeenCalculatedBefore(blueprint)) {
					updatedBlueprint.result = [];
					updatedBlueprint.timestampResultData = 0;
					updatedBlueprint.notification.lastSeen = [];
					updatedBlueprint.notification.lastNotified = [];
					promiseTriggerAsync = this.createAsyncCalcTrigger$();
				}
				return this.scanService.updateScan(updatedBlueprint).pipe(
					onlyFirstEmitWillPass(),
					switchMap(() => promiseTriggerAsync()),
					mapTo(updatedBlueprint.id));
			}
			));
	}

	hasChanged(): boolean {
		return !areObjectsEqual(this.unmodifiedBlueprint, this.currentBlueprintSnapshot);
	}


	// private


	private getCurrentBlueprint$() {
		return this.buildSubject.asObservable().pipe(
			map(bp => ({...bp})),
			startWith(this.createDefaultScanBlueprint()),
			tap(bp => this.currentBlueprintSnapshot = bp),
			shareReplay(1),
			mapToClone(),
		);
	}

	private getBuildError$() {
		return this.currentBlueprint$.pipe(
			map(blueprint => runPlausibilityChecks(blueprint)),
			distinctUntilChanged((oldArray, newArray) => areArraysEqual(oldArray, newArray))
		);
	}

	private loadBlueprint(blueprint: ScanFrontend) {
		this.unmodifiedBlueprint = blueprint;
		this.buildSubject.next(blueprint);
	}

	private copyExistingOrCreateNew(id: number): Observable<ScanFrontend> {
		if (this.isNewId(id)) {
			return of(this.createDefaultScanBlueprint());
		} else {
			return this.scanService.getScan$(id);
		}
	}

	private createAsyncCalcTrigger$(): () => Observable<boolean> {
		return () => {
			this.auth.getTokenId$().pipe(
				switchMap((tokenId) => triggerAsyncScanCalculation(tokenId, this.http)),
				map((resp: ResponseRunAsyncScan) => {
					console.log('Response from async run', resp, resp.success);
					if (! resp.success) {
						throw resp.msg;
					}
				}),
				retry(2), //retry up to 2 times on error
				take(1),
			).subscribe({
				next: () => console.log('Success ! New scan calculated.'),
				error: (errMsg) => console.error(`Error during async calculation of new scan: ${errMsg}`)
			}); // not waiting for response ! Done in scan view via update of user data
			return of(true).pipe(
				delay(this.delayAfterTriggerAsyncMs) // Wait 500 ms to make sure request is send
			);
		};
	}

	private getId(scans: Scan[], id?: number | string): number {
		if (this.isNewId(id)) {
			return this.calculateNewId(scans);
		} else {
			return id as number;
		}
	}

	private calculateNewId(scans: Scan[]): number {
		let id = 0;
		if (scans.length > 0) {
			const ids = scans.map(scan => scan.id);
			id = Math.max(...ids) + 1;
		}
		return id;
	}

	private isNewId(id?: number | string): boolean {
		return id === undefined || typeof id === typeof '' || isNaN(id as number);
	}

	private hasChangedInPreselectionOrConditions(scan: Scan): boolean {
		const hasChangedInPreSelection = !areObjectsEqual(this.unmodifiedBlueprint.preSelection, scan.preSelection);
		const hasChangedInConditions = !areObjectsEqual(this.unmodifiedBlueprint.conditions, scan.conditions);
		return hasChangedInPreSelection || hasChangedInConditions;
	}

	private hasNeverBeenCalculatedBefore(scan: Scan): boolean {
		return scan.timestampResultData === 0;
	}

	private createDefaultScanBlueprint(): ScanFrontend {
		const snapshot: Scan = {
			title: 'New Filter',
			id: 0,
			iconId: getRandomScanIconId(),
			asset: 'coin',
			conditions: [],
			preSelection: lookupAssetFactory['coin'].createDefaultPreSelection(),
			notification: {lastSeen: [], lastNotified: [], isEnabled: false},
			result: [],
			timestampResultData: 0
		};
		return mapScan2Frontend(snapshot);
	}
}
