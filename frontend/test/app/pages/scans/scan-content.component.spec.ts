import {buildAllMocks, MockControlArray} from '@test/helper-frontend/mocks/all';
import {expectMarbles, marbleRun} from '@test/helper-frontend/marble/functions.spec';
import {lookupMarble2PermissionCheckResult, MarbleLookup} from '@test/helper-frontend/marble/lookup';
import {cold} from 'jasmine-marbles';
import {of} from 'rxjs';
import {ScanFrontend} from '@app/lib/scan/interfaces';
import {createDummyScanFronted} from '@test/helper-frontend/dummy-data/view';
import {map, tap} from 'rxjs/operators';
import {Coin} from '@app/lib/coin/interfaces';
import {createDummyCoin} from '@test/helper-frontend/dummy-data/asset-specific/coin';
import {materialIcons} from '@app/lib/global/icons';
import {ScanContentComponent} from '@pages_scans/scan-content/scan-content.component';
import {AssetIdCoin} from '../../../../../shared-library/src/asset/assets/coin/interfaces';
import {deepCopy} from '@shared_library/functions/general/object';
import {ParamMap} from '@angular/router';
import {SortRequestScanContent} from '@pages_scans/scan-content/interfaces';


describe('ResultComponent', function () {
    const lookupId: MarbleLookup<number> = {
        a: 10,
        b: 42,
        c: 'Miau' as any as number
    };
    const lookupSortRequest: MarbleLookup<SortRequestScanContent> = {
        a: {metric: 'rank', ascending: true, forceNewIdsFirst: true},
        b: {metric: 'price', ascending: true},
        d: {metric: 'price', ascending: false}
    };
    const lookupParamMap: MarbleLookup<Partial<ParamMap>> = {
        a: {get: (s: string) => `${lookupId.a}`},
        b: {get: (s: string) => `${lookupId.b}`},
        c: {get: (s: string) => `${lookupId.c}`},
    };
    let component: ScanContentComponent;
    let mocks: MockControlArray;

    beforeEach(function () {
        mocks = buildAllMocks();
        component = new ScanContentComponent(
            mocks.route.mock, mocks.scan.mock, mocks.coin.mock, mocks.location.mock,
            mocks.router.mock, mocks.dialog.mock, mocks.snackbar.mock, mocks.role.mock, mocks.userLastSelection.mock,
            mocks.routeInfo.mock);
        component.ngOnInit();
    });

    describe('Test stream scan ', function () {
        const lookupScans: MarbleLookup<ScanFrontend> = {
            a: createDummyScanFronted(lookupId.a),
            b: createDummyScanFronted(lookupId.b),
        };

        beforeEach(function () {
            spyOn(mocks.scan.mock, 'getScan$')
                .withArgs(lookupId.a).and.returnValue(of(lookupScans.a))
                .withArgs(lookupId.b).and.returnValue(of(lookupScans.b))
                .withArgs(NaN).and.returnValue(of(undefined));
        });

        it('should select / update scan according to ID', () => marbleRun(env => {
            mocks.route.control.paramMap$ = env.hot('a-b-b-a', lookupParamMap);
            const expected$ = cold(                 'a-b---a', lookupScans);
            expectMarbles(component.scan$, expected$, env);
        }));

        it('should return undefined scan if no ID given', () => marbleRun(env => {
            mocks.route.control.paramMap$ = env.hot('c-b-a', lookupParamMap);
            const expected$ = cold(                 'u-b-a', {...lookupScans, u: undefined});
            expectMarbles(component.scan$, expected$, env);
        }));
    });

    describe('Test sort info ', function () {

        function act(trigger$, expected$, env): void {
            trigger$.subscribe(info => component.onClickAtSortLabel(info));
            expectMarbles(component.sortReq$, expected$, env);
        }

        it(`should init according to last user selection`, () => marbleRun(env => {
            const trigger$ = env.hot('--', lookupSortRequest);
            const expected$ = cold(  'a-', lookupSortRequest);
            act(trigger$, expected$, env);
        }));

        it(`should init according to last user selection (second check)`, () => marbleRun(env => {
            mocks.userLastSelection.mock.screenScanContent.lastSortRequest = lookupSortRequest.b;
            component.ngOnInit();
            const trigger$ = env.hot('--', lookupSortRequest);
            const expected$ = cold(  'b-', lookupSortRequest);
            act(trigger$, expected$, env);
        }));

        it(`should set forceNewIdsFirst if coming from main page`, () => marbleRun(env => {
            mocks.userLastSelection.mock.screenScanContent.lastSortRequest = lookupSortRequest.b;
            mocks.routeInfo.mock.previousUrl = 'https/miau/menu';
            component.ngOnInit();
            const expectedReq = {...lookupSortRequest.b, forceNewIdsFirst: true};
            const trigger$ = env.hot('--', lookupSortRequest);
            const expected$ = cold(  'a-', {a: expectedReq});
            act(trigger$, expected$, env);
            expect(lookupSortRequest.b.forceNewIdsFirst).toBeUndefined();
        }));

        it('should debounce input by 200ms', () => marbleRun(env => {
            const trigger$ = env.hot('--a-b-a-b-- 196ms --', lookupSortRequest);
            const expected$ = cold(  'a---------- 196ms -b', lookupSortRequest);
            act(trigger$, expected$, env);
        }));

        it('should not update if input not changed', () => marbleRun(env => {
            const trigger$ = env.hot('--a-b-a- 200ms -', lookupSortRequest);
            const expected$ = cold(  'a------- 200ms -', lookupSortRequest);
            act(trigger$, expected$, env);
        }));

        it('should update input on change', () => marbleRun(env => {
            const trigger$ = env.hot('-- a- 200ms b- 198ms -- a- 198ms --', lookupSortRequest);
            const expected$ = cold(  'a- -- 200ms -- 198ms b- -- 198ms a-', lookupSortRequest);
            act(trigger$, expected$, env);
        }));
    });

    describe('Test asset stream ', function () {
        let scan: ScanFrontend;
        const coinIds: AssetIdCoin[] = ['id0', 'id1', 'id2', 'id42', 'id103'];
        const coins: Coin[] = coinIds.map((id, idx) => createDummyCoin(id, idx));
        const lookupCoinIds: MarbleLookup<AssetIdCoin[]> = {
            a: coinIds,
            b: ['id0', 'id2', 'id103'],
            c: [],
            d: ['id103', 'id2', 'id0'],
            e: ['id103'],
            f: ['id2', 'id0', 'id103'],
        };

        beforeEach(function () {
            mocks.coin.control.coins$ = of(coins);
            mocks.route.control.paramMap$ = cold('a', lookupParamMap);
            scan = createDummyScanFronted();
            scan.result = lookupCoinIds.b;
            spyOn(mocks.scan.mock, 'getScan$').and.returnValue(of(scan));
        });

        function expectIds(expected$, env): void {
            const ids$ = component.assets$.pipe(
                tap(x => console.log('get ', x)),
                map(coins => coins.map(coin => coin.id)));
            expectMarbles(ids$, expected$, env);
        }

        it('should start with one emit', () => marbleRun(env => {
            const expected$ = cold('b-', lookupCoinIds);
            expectIds(expected$, env);
        }));

        xit('should filter dynamically based on view content', () => marbleRun(env => {
            const ids$ = env.hot('a-b-c--c-b-a', lookupCoinIds);
            const expected$ = cold('a-b-c--c-b-a', lookupCoinIds);
            ids$.subscribe(id => {
                scan.result = id;
            });
            expectIds(expected$, env);
        }));

        it('should sort dynamically based on sort info', () => marbleRun(env => {
            const trigger$ = env.hot('- -d 198ms -- -b 198ms --', lookupSortRequest);
            const expected$ = cold('b -- 198ms -d -- 198ms -b', lookupCoinIds);
            trigger$.subscribe(info => component.onClickAtSortLabel(info));
            expectIds(expected$, env);
        }));

        it('should filter dynamically based on search term', () => marbleRun(env => {
            const lookupSearchTerm: MarbleLookup<string> = {b: '', e: coins[4].info.name};
            const trigger$ = env.hot('- -e 198ms -- -b 198ms --', lookupSearchTerm);
            const expected$ = cold('b -- 198ms -e -- 198ms -b', lookupCoinIds);
            trigger$.subscribe(term => component.updateSearch(term));
            expectIds(expected$, env);
        }));

        it('should put assets which are new in scan first if requested', () => marbleRun(env => {
            scan.notification.lastSeen = ['id0', 'id103']; // 'id2' will be new
            const trigger$ = env.hot('- -d 198ms -- -b 198ms --', lookupSortRequest);
            const expected$ = cold('f -- 198ms -d -- 198ms -b', lookupCoinIds);
            trigger$.subscribe(info => component.onClickAtSortLabel(info));
            expectIds(expected$, env);
        }));
    });

    describe('Test delete option', function () {

        function act(callsDelete: number, callsBack: number, callsSnack: number, env) {
            const spyLocation = spyOn(mocks.location.mock, 'back');
            const spySnackbar = spyOn(mocks.snackbar.mock, 'open');
            const spyDelete = spyOn(mocks.scan.mock, 'deleteScan$').and.returnValue(of(true));
            const scan = {...createDummyScanFronted(), id: lookupId.b};
            spyOn(mocks.scan.mock, 'getScan$').and.returnValue(of(scan));
            mocks.route.control.paramMap$ = cold('b', lookupParamMap);
            component.onClickAtAppBar(materialIcons.delete);
            env.flush();
            expect(spyDelete).toHaveBeenCalledTimes(callsDelete);
            expect(spyLocation).toHaveBeenCalledTimes(callsBack);
            expect(spySnackbar).toHaveBeenCalledTimes(callsSnack);
            if (callsDelete > 0) {
                expect(spyDelete).toHaveBeenCalledWith(lookupId.b);
            }
        }

        it('should do nothing if dialog is canceled', () => marbleRun(env => {
            mocks.dialog.control.afterClosed$ = of(false);
            act(0, 0, 0, env);
        }));

        it('should show snackbar if permission is denied', () => marbleRun(env => {
            mocks.dialog.control.afterClosed$ = of(true);
            mocks.role.control.permission$ = of(lookupMarble2PermissionCheckResult.f);
            act(0, 0, 1, env);
        }));

        it('should delete and return if user accepts and has permission', () => marbleRun(env => {
            mocks.dialog.control.afterClosed$ = of(true);
            mocks.role.control.permission$ = of(lookupMarble2PermissionCheckResult.t);
            act(1, 1, 0, env);
        }));
    });

    describe('Test FAB', function () {

        it('should navigate to modify when clicked on fab', () => marbleRun(env => {
            const scan = {...createDummyScanFronted(), id: lookupId.b};
            const spy = spyOn(component['router'], 'navigate');
            spyOn(mocks.scan.mock, 'getScan$').and.returnValue(of(scan));
            mocks.route.control.paramMap$ = cold('b', lookupParamMap);
            component.goToModifyScan();
            env.flush();
            const firstParam = spy.calls.allArgs()[0][0][0];
            expect(firstParam).toContain(`build/${lookupId.b}`);
            expect(spy).toHaveBeenCalledTimes(1);
        }));
    });

    describe('Test app bar - search button', function () {

        it('should start with search bar closed', function () {
            expect(component.isSearchDialogActive).toBeFalsy();
        });

        it('should open search bar on click at search icon', function () {
            component.onClickAtAppBar(materialIcons.search);
            expect(component.isSearchDialogActive).toBeTruthy();
        });

        it('should close search bar on demand', function () {
            component.isSearchDialogActive = true;
            component.closeSearchBar();
            expect(component.isSearchDialogActive).toBeFalsy();
        });
    });

    describe('Test app bar - return button', function () {
        let currentScan: ScanFrontend;
        let spyRouter: jasmine.Spy;
        let spyScanUpdate: jasmine.Spy;

        function act(result): void {
            spyRouter = spyOn(mocks.router.mock, 'navigate');
            spyScanUpdate = spyOn(mocks.scan.mock, 'updateScan').and.returnValue(of(true));
            mocks.route.control.paramMap$ = of(lookupParamMap.a);
            // prepare scan result
            currentScan = createDummyScanFronted();
            currentScan.notification.lastSeen = ['wuff'];
            currentScan.result = result;
            spyOn(mocks.scan.mock, 'getScan$').and.returnValue(of(currentScan));
            // act
            component.onClickAtAppBar(materialIcons.back);
        }

        function expectLastSeenWasUpdated(result): void {
            const expected = deepCopy(currentScan);
            expected.notification.lastSeen = result;
            expect(spyScanUpdate).toHaveBeenCalledTimes(1);
            expect(spyScanUpdate).toHaveBeenCalledWith(expected);
        }

        it('should update last seen ids of scan if clicked', function () {
            const result = ['bibidibubidi', 'foo', 'bar'];
            act(result);
            expectLastSeenWasUpdated(result);
            expect(spyRouter).toHaveBeenCalledTimes(1);
        });

        it('should update according to index', function () {
            const result = ['bibidibubidi', 'foo', 'bar'];
            act(result);
            expectLastSeenWasUpdated(result);
            expect(spyRouter).toHaveBeenCalledTimes(1);
        });

        it('should not update if result and last seen are already equal', function () {
            const result = ['wuff'];
            act(result);
            expect(spyScanUpdate).toHaveBeenCalledTimes(0);
            expect(spyRouter).toHaveBeenCalledTimes(1);
        });
    });
});
