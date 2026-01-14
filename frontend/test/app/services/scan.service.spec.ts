import {expectMarbles, marbleRun} from '@test/helper-frontend/marble/functions.spec';
import {createDummyUserData} from '../../../../shared-library/src/functions/test-utils/dummy-data/user';
import {cold} from 'jasmine-marbles';
import {map, shareReplay, switchMap} from 'rxjs/operators';
import {Observable, of} from 'rxjs';
import {mapToClone} from '@app/lib/rxjs/map-to-clone';
import {buildAllMocks, MockControlArray} from '@test/helper-frontend/mocks/all';
import {lookupMarble2Numbers, MarbleLookup} from '@test/helper-frontend/marble/lookup';
import {UserData} from '../../../../shared-library/src/datatypes/user';
import {ScanService} from '@app/services/scan.service';
import {Scan} from '@shared_library/scan/interfaces';
import {mapScan2Frontend} from '@lib/firestore/mapFirestore';
import {deepCopy} from '@shared_library/functions/general/object';
import {assetCoin} from '@shared_library/asset/lookup-asset-factory';
import {ScanFrontend} from '@lib/scan/interfaces';
import {createDummyScan} from "@shared_library/functions/test-utils/dummy-data/scan";


describe('Test scan service', () => {
	const lookupMarble2ScanId: MarbleLookup<number> = {a: 420, b: 123, c: 666, d: 0, e: 1, f: -1};
	let userData: UserData;
	let mocks: MockControlArray;
	let service: ScanService;

	beforeEach(() => {
		userData = createDummyUserData(3, 0);
		userData.scans[0].id = lookupMarble2ScanId.a;
		userData.scans[1].id = lookupMarble2ScanId.b;
		userData.scans[2].id = lookupMarble2ScanId.c;
		mocks = buildAllMocks();
		service = new ScanService(mocks.user.mock);
	});

	describe('Test scan stream', function () {
		let lookupNumberOfScans: MarbleLookup<number>;
		let lookupUserData: MarbleLookup<UserData>;

		beforeEach(function () {
			lookupUserData = {
				a: createDummyUserData(3, 10),
				b: createDummyUserData(4, 100)
			};
			lookupNumberOfScans = {
				a: lookupUserData['a'].scans.length,
				b: lookupUserData['b'].scans.length
			};
		});

		it('should have correct test environment', () => {
			expect(lookupNumberOfScans.a).not.toEqual(lookupNumberOfScans.b);
		});

		it('should update scans on change of user data', () => marbleRun( env => {
			mocks.user.control.user$ = cold('a-b-b-a-a-b', lookupUserData);
			const expected$ = cold(         'a-b---a---b', lookupNumberOfScans);
			const view$ = service.scans$.pipe( map(views => views.length) );
			expectMarbles(view$, expected$, env);
		}));

		it('should sort scans according to number of new assets', () => marbleRun( env => {
			const lookupScanTitleOrder: MarbleLookup<string[]> = {
				a: ['Dummy10', 'Dummy11', 'Dummy12'],
				c: ['Dummy11', 'Dummy10', 'Dummy12']
			};
			(lookupUserData as any)['c'] = deepCopy(lookupUserData.a);
			lookupUserData.c.scans[1].result = assetCoin.getIds();
			lookupUserData.c.scans[1].notification.lastSeen = assetCoin.getIds().slice(1);
			mocks.user.control.user$ = cold('a-c-c-a-', lookupUserData);
			const expected$ = cold(         'a-c---a-', lookupScanTitleOrder);
			const title$ = service.scans$.pipe( map(scans => scans.map(s => s.title)) );
			expectMarbles(title$, expected$, env);
		}));
	});

	describe('Test get scan by ID', function () {

		beforeEach(function () {
			mocks.user.control.user$ = of(userData).pipe(shareReplay(1));
		});

		function act(id$: Observable<number>, expected$, env): void {
			const result$ = id$.pipe(
					switchMap(id => service.getScan$(id)),
					map( scan => scan.iconId)
			);
			expectMarbles(result$, expected$, env);
		}

		it('should update given scan based on given id', () => marbleRun( env => {
			const id$ = cold(      'a-b-c-c-b-a', lookupMarble2ScanId);
			const expected$ = cold('a-b-c-c-b-a', lookupMarble2Numbers);
			act(id$, expected$, env);
		}));

		it('should skip invalid id', () => marbleRun( env => {
			const id$ = cold(      'a-b-c--d-e-f--a', lookupMarble2ScanId);
			const expected$ = cold('a-b-c---------a', lookupMarble2Numbers);
			act(id$, expected$, env);
		}));
	});

	describe('Test delete scan by ID', function () {
		const lookupRemainingIconIds: MarbleLookup<number[]> = {
			a: [1, 2],
			b: [0, 2],
			c: [0, 1]
		};

		beforeEach(function () {
			mocks.user.control.user$ = of(userData).pipe(
					shareReplay(1),
					mapToClone()  // create every time a complete new object (otherwise the reference is modified)
			);
		});

		function act(id$: Observable<number>, expected$, env): void {
			spyOn(mocks.user.mock, 'updateUserData').and.callFake( (data) => of(data as any as boolean)); // dirty trick to get updated data
			const remainingIconIds$ = id$.pipe(
					switchMap(idx => service.deleteScan$(idx)),
					map(data => (data as any as UserData).scans),
					map(scans => scans.map(scan => scan.iconId)),
			);
			expectMarbles(remainingIconIds$, expected$, env);
		}

		it('should delete scan based on given id', () => marbleRun( env => {
			const id$ = cold(   	'a-b-c-c-b-a', lookupMarble2ScanId);
			const expected$ = cold( 'a-b-c-c-b-a', lookupRemainingIconIds);
			act(id$, expected$, env);
		}));

		it('should skip invalid id', () => marbleRun( env => {
			const id$ = cold(      'a-b-c--d-e-f--g--c-c', lookupMarble2ScanId);
			const expected$ = cold('a-b-c------------c-c', lookupRemainingIconIds);
			act(id$, expected$, env);
		}));
	});

	describe('Test update scan', function () {
		let scans: Scan[];
		let spyUpdate: jasmine.Spy;

		beforeEach(function () {
			scans = userData.scans;
			spyUpdate = spyOn(mocks.user.mock, 'updateUserData').and.returnValue(of(true));
		});

		function act(scanToUpdate: Scan | ScanFrontend, env): boolean {
			let wasSuccessful: boolean;
			mocks.user.control.user$ = cold('a-', {a: {...userData, scans: scans}}).pipe(shareReplay(1));
			const copy = deepCopy(scanToUpdate);
			service.updateScan(copy).subscribe(resp => {wasSuccessful = resp;});
			env.flush();
			return wasSuccessful;
		}

		function expectSuccessfulUpdate(expectedUpdatedScans: Scan[]): void {
			expect(spyUpdate).toHaveBeenCalledTimes(1);
			expect(spyUpdate.calls.argsFor(0)).toEqual([{scans: expectedUpdatedScans}]);
		}

		describe('Other', function () {

			it('should only update once even if new scans read (endless loop)', () => marbleRun( env => {
				const scan = scans[0];
				const lookupUserData = {a: createDummyUserData(3, 10), b: createDummyUserData(4, 20)};
				mocks.user.control.user$ = cold('a-b-b-a-b-a', lookupUserData).pipe(shareReplay(1));
				service.updateScan(scan).subscribe();
				env.flush();
				expect(spyUpdate).toHaveBeenCalledTimes(1);
			}));
		});

		describe('Convert to normal scans', function () {

			it('should handle normal scans (no frontend scans)', () => marbleRun( env => {
				const scan = scans[0];
				const response = act(scan, env);
				expect(response).toBeTruthy();
				expectSuccessfulUpdate([...scans]);
			}));

			it('should convert frontend scans to normal scans for update', () => marbleRun( env => {
				const scanFrontend = mapScan2Frontend(scans[0]);
				const response = act(scanFrontend, env);
				expect(response).toBeTruthy();
				expectSuccessfulUpdate([...scans]);
			}));
		});

		describe('Merge of updated scan in overall scan array by id', function () {

			it('should overwrite scan if scan id does already exist (idx=1)', () => marbleRun( env => {
				const scan = scans[1];
				const response = act(scan, env);
				expect(response).toBeTruthy();
				expectSuccessfulUpdate([...scans]);
			}));

			it('should overwrite scan if scan id does already exist (idx=2)', () => marbleRun( env => {
				const scan = scans[2];
				const response = act(scan, env);
				expect(response).toBeTruthy();
				expectSuccessfulUpdate([...scans]);
			}));

			it('should add scan if scan id is valid but does not already exist', () => marbleRun( env => {
				const scan = {...scans[1], id: 125};
				const response = act(scan, env);
				expect(response).toBeTruthy();
				expectSuccessfulUpdate([...scans, scan]);
			}));

			it('should not add scan if scan id is a string', () => marbleRun( env => {
				const scan = {...scans[1], id: 'miau' as any as number};
				const response = act(scan, env);
				expect(response).toBeFalse();
				expect(spyUpdate).toHaveBeenCalledTimes(0);
			}));

			it('should not add scan if scan id is NaN', () => marbleRun( env => {
				const scan = {...scans[1], id: NaN};
				const response = act(scan, env);
				expect(response).toBeFalse();
				expect(spyUpdate).toHaveBeenCalledTimes(0);
			}));

			it('should not add scan if scan id is undefined', () => marbleRun( env => {
				const scan = {...scans[1], id: undefined};
				const response = act(scan, env);
				expect(response).toBeFalse();
				expect(spyUpdate).toHaveBeenCalledTimes(0);
			}));
		});
	});

	describe('Test update multiple scans', function () {
		let scans: Scan[];
		let spyUpdate: jasmine.Spy;

		beforeEach(function () {
			scans = userData.scans;
			spyUpdate = spyOn(mocks.user.mock, 'updateUserData').and.returnValue(of(true));
		});

		function act(scansToUpdate: Scan[] | ScanFrontend[], env): boolean {
			let wasSuccessful: boolean;
			mocks.user.control.user$ = cold('a-', {a: {...userData, scans: scans}}).pipe(shareReplay(1));
			const copy = deepCopy(scansToUpdate);
			service.updateScans(copy).subscribe(resp => {wasSuccessful = resp;});
			env.flush();
			return wasSuccessful;
		}

		function expectSuccessfulUpdate(expectedUpdatedScans: Scan[]): void {
			expect(spyUpdate).toHaveBeenCalledTimes(1);
			expect(spyUpdate.calls.argsFor(0)).toEqual([{scans: expectedUpdatedScans}]);
		}

		describe('Convert to normal scans', function () {

			it('should handle normal scans (no frontend scans)', () => marbleRun( env => {
				const response = act(scans, env);
				expect(response).toBeTruthy();
				expectSuccessfulUpdate([...scans]);
			}));

			it('should convert frontend scans to normal scans for update', () => marbleRun( env => {
				const scansFrontend = scans.map(mapScan2Frontend);
				const response = act(scansFrontend, env);
				expect(response).toBeTruthy();
				expectSuccessfulUpdate([...scans]);
			}));
		});

		describe('Check ids', function () {

			it('should overwrite everything', () => marbleRun( env => {
				const dummyScans = [createDummyScan()];
				dummyScans[0].id = 1234666;
				const response = act(dummyScans, env);
				expect(response).toBeTruthy();
				expectSuccessfulUpdate([...dummyScans]);
			}));

			it('should not update scans if at least one id is not unique', () => marbleRun( env => {
				scans[0].id = scans[2].id;
				const response = act(scans, env);
				expect(response).toBeFalse();
				expect(spyUpdate).toHaveBeenCalledTimes(0);
			}));

			it('should not update scans if at least one id is not valid (NaN)', () => marbleRun( env => {
				scans[1].id = NaN;
				const response = act(scans, env);
				expect(response).toBeFalse();
				expect(spyUpdate).toHaveBeenCalledTimes(0);
			}));

			it('should not update scans if at least one id is not valid (undefined)', () => marbleRun( env => {
				scans[1].id = undefined;
				const response = act(scans, env);
				expect(response).toBeFalse();
				expect(spyUpdate).toHaveBeenCalledTimes(0);
			}));
		});
	});

});
