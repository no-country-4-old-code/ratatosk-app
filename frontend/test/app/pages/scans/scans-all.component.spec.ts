import {buildAllMocks, MockControlArray} from '@test/helper-frontend/mocks/all';
import {marbleRun} from '@test/helper-frontend/marble/functions.spec';
import {AllScansComponent} from '@pages_scans/scans/all-scans.component';
import {of} from "rxjs";
import {shareReplay} from "rxjs/operators";
import {UserRole} from "@lib/user-role/permission-check/interfaces";
import {ScanFrontend} from "@lib/scan/interfaces";
import {AssetId} from "@shared_library/datatypes/data";
import {createDummyScanFronted} from "@test/helper-frontend/dummy-data/view";

describe('Test display of all scans', function () {
    let component: AllScansComponent;
    let mocks: MockControlArray;

    beforeEach(function () {
        mocks = buildAllMocks();
        component = new AllScansComponent(mocks.scan.mock, mocks.router.mock, mocks.route.mock, mocks.areScanSync.mock, mocks.role.mock);
    });

    describe('Test navigation ', function () {
        let spy: jasmine.Spy;

        beforeEach(function () {
            spy = spyOn(mocks.router.mock, 'navigate');
        });

        function expectNavigation(url: string) {
            const firstParam = spy.calls.argsFor(0)[0][0];
            expect(spy).toHaveBeenCalledTimes(1);
            expect(firstParam).toEqual(url);
        }

        it('should navigate to scan by click on card', () => marbleRun(env => {
            const scanId = 42;
            component['navigateToScan'](scanId);
            expectNavigation(`result/${scanId}`);
        }));

        it('should navigate to add new scan screen by click on fab', () => marbleRun(env => {
            component.navigateToBuildScan();
            expectNavigation('build/new');
        }));
    });

    describe('Test sync', function () {
        const result: AssetId<'coin'>[] = ['bitcoin', 'ethereum'];
        let spyUpdate: jasmine.Spy;
        let scans: ScanFrontend[];

        function createFrontendScan(result, lastSeen, lastNotified): ScanFrontend {
            const scan = createDummyScanFronted();
            scan.result = result;
            scan.notification.lastSeen = lastSeen;
            scan.notification.lastNotified = lastNotified;
            return scan;
        }

        function act(role: UserRole, expectedCalls: number, env: any) {
            mocks.role.control.role$ = of(role).pipe(shareReplay(1));
            mocks.scan.control.scans$ = of(scans).pipe(shareReplay(1));
            component = new AllScansComponent(mocks.scan.mock, mocks.router.mock, mocks.route.mock, mocks.areScanSync.mock, mocks.role.mock);
            env.flush();
            expect(spyUpdate).toHaveBeenCalledTimes(expectedCalls);
        }

        beforeEach(function () {
            scans = [createFrontendScan([], result, result)];
            spyUpdate = spyOn(mocks.scan.mock, 'updateScans').and.returnValue(of(true));
        });

        it('should syncronize if at least one scans have no unseen assets & user is pro (1 scan)', () => marbleRun( env =>  {
            act('pro', 1, env);
        }));

        it('should not syncronize if user is no pro user', () => marbleRun( env => {
            act('user', 0, env);
        }));

        it('should not syncronize if all scans have unseen assets (1 scan)', () => marbleRun( env => {
            scans[0].result = result;
            act('pro', 0, env);
        }));

        it('should not syncronize if all scans have unseen assets (5 scan)', () => marbleRun( env => {
            const miauCoin = ['miau'];
            scans[0].result = result;
            scans = [...scans,
                createFrontendScan([], [], []),
                createFrontendScan(miauCoin, [], []),
                createFrontendScan(miauCoin, result, []),
                createFrontendScan(miauCoin, miauCoin, miauCoin)
            ];
            act('pro', 0, env);
        }));

        it('should syncronize if at least one scans have no unseen assets & user is pro (4 scan)', () => marbleRun( env => {
            const miauCoin = ['miau'];
            scans[0].result = result;
            scans = [...scans,
                createFrontendScan([], [], []),
                createFrontendScan([result[0]], result, result),
                createFrontendScan(miauCoin, miauCoin, miauCoin)
            ];
            act('pro', 1, env);
        }));
    });

});
