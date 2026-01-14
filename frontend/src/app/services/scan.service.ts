import {Injectable} from '@angular/core';
import {UserService} from '@app/services/user.service';
import {distinctUntilChanged, filter, map, shareReplay, switchMap, tap} from 'rxjs/operators';
import {Observable, of} from 'rxjs';
import {ScanFrontend} from '@app/lib/scan/interfaces';
import {selectByStaticIdx$} from '@app/lib/rxjs/select-by-idx$';
import {mapFrontend2Scan, mapScan2Frontend} from '@app/lib/firestore/mapFirestore';
import {areArraysEqual} from '../../../../shared-library/src/functions/general/array';
import {Scan} from '@shared_library/scan/interfaces';
import {mapToClone} from '@lib/rxjs/map-to-clone';
import {sortElements} from '@lib/coin/sort';
import {withLatestFromRequested} from '@lib/rxjs/with-latest-from-requested';
import {onlyFirstEmitWillPass} from '@lib/rxjs/only-first-emit-will-pass';


@Injectable({
	providedIn: 'root'
})
export class ScanService {
	readonly scans$: Observable<ScanFrontend[]>;

	constructor(private user: UserService) {
		this.scans$ = this.getScans$();
	}

	getScan$(id: number): Observable<ScanFrontend> {
		return this.getScanIdx$(id).pipe(
			withLatestFromRequested(this.scans$),
			switchMap(([idx, scans]) => selectByStaticIdx$(of(scans), idx, true))
		);
	}

	deleteScan$(id: number): Observable<boolean> {
		return this.getScanIdx$(id).pipe(
			onlyFirstEmitWillPass(),
			withLatestFromRequested<number, ScanFrontend[]>(this.scans$),
			map(([idx, scans]) => {scans.splice(idx, 1); return scans;}),
			switchMap(scans => this.updateScans(scans))
		);
	}

	updateScan(scan: ScanFrontend | Scan): Observable<boolean> {
		if (this.isIdValid(scan.id)) {
			return this.mergeAndUpdateScan(scan);
		}
		else {
			console.warn('Tried to update scan with bad scan id', scan.id, scan);
			return of(false);
		}
	}

	updateScans(scansFrontend: (ScanFrontend | Scan)[]): Observable<boolean> {
		const ids = scansFrontend.map(scan => scan.id);
		const allIdsAreValid = ids.every(this.isIdValid);
		const allIdsAreUnique = this.allIdsAreUnique(ids);
		if (allIdsAreValid && allIdsAreUnique) {
			const scans = scansFrontend.map(scan => mapFrontend2Scan(scan));
			return this.user.updateUserData({scans});
		} else {
			console.warn('Tried to update scans with bad scan id', scansFrontend);
			return of(false);
		}
	}

	// private

	private mergeAndUpdateScan(scan: ScanFrontend | Scan): Observable<boolean> {
		return this.scans$.pipe(
			onlyFirstEmitWillPass(),
			map(scans => this.mergeIntoScans(scan, scans)),
			switchMap(scans => this.updateScans(scans))
		);
	}

	private mergeIntoScans(modifiedScan: Scan, scans: Scan[]): Scan[] {
		const idx = this.mapId2Index(modifiedScan.id, scans);
		const newScans = [...scans];
		if (idx >= 0 && idx < scans.length) {
			newScans[idx] = modifiedScan;
		} else {
			newScans.push(modifiedScan);
		}
		return newScans;
	}

	private getScans$(): Observable<ScanFrontend[]> {
		return this.user.user$.pipe(
			map(user => user.scans),
			map(scans => this.mapScans2FrontendScans(scans)),
			map( scans => this.sortScansByNumberOfNewAssets(scans)),
			distinctUntilChanged((oldArray, newArray) => areArraysEqual(oldArray, newArray)),
			tap(x => console.warn('Got new filters', x)),
			shareReplay(1),
			mapToClone());
	}

	private getScanIdx$(id: number): Observable<number> {
		return this.scans$.pipe(
			map(scans => this.mapId2Index(id, scans)),
			tap(idx => this.logErrorIfNotFound(idx, 'getScanIdx$ could not find scan with ' + id)),
			filter(idx => idx >= 0)
		);
	}

	private mapScans2FrontendScans(scans: Scan[]): ScanFrontend[] {
		return scans.map(scan => mapScan2Frontend(scan));
	}

	private mapId2Index(id: number, scans: Scan[]): number {
		return scans.findIndex(scan => scan.id === id);
	}

	private sortScansByNumberOfNewAssets(scans: ScanFrontend[]): ScanFrontend[] {
		const accessorFunc = (scan: ScanFrontend) => scan.numberOfNewAndUnseenAssets;
		return sortElements(scans, accessorFunc, false);
	}

	private isIdValid(id: number): boolean {
		return id !== undefined && typeof id === typeof 1 && ! isNaN(id)
	}

	private logErrorIfNotFound(obj: any, errMsg: string): void {
		if (obj === undefined || obj < 0) {
			console.error('Error : ', errMsg);
		}
	}

	private allIdsAreUnique(ids: number[]): boolean {
		const onlyUnique = (value, index, self) => self.indexOf(value) === index;
		return ids.every(onlyUnique);
	}
}
