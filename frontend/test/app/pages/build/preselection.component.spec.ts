import {buildAllMocks, MockControlArray} from '@test/helper-frontend/mocks/all';
import {expectMarbles, marbleRun} from '@test/helper-frontend/marble/functions.spec';
import {cold} from 'jasmine-marbles';
import {
    PreselectionComponent,
    PreSelectionParamData
} from '@app/pages/build-scan/preselection-menu/preselection.component';
import {MarbleLookup} from '@test/helper-frontend/marble/lookup';
import {ScanFrontend} from '@lib/scan/interfaces';
import {createDummyScanFronted} from '@test/helper-frontend/dummy-data/view';
import {lookupAssetFactory} from '@shared_library/asset/lookup-asset-factory';
import {PreSelectionBlueprint} from '@shared_library/scan/pre-selection/interfaces';
import {of} from 'rxjs';
import {AssetId} from '@shared_library/datatypes/data';

describe('PreselectionComponent', () => {
    const assetFactory = lookupAssetFactory['coin'];
    const defaultPreselection = assetFactory.createDefaultPreSelection();
    const lookupIds: MarbleLookup<AssetId<'coin'>[]> = {
        a: assetFactory.getIds(),
        b: assetFactory.getIds().slice(2, 6),
        e: []
    };
    const lookupPreselect: MarbleLookup<PreSelectionBlueprint<'coin'>> = {
        a: {...defaultPreselection, manual: lookupIds.a},
        b: {...defaultPreselection, manual: lookupIds.b},
        e: {...defaultPreselection, manual: lookupIds.e},
    };
    const lookupScan: MarbleLookup<ScanFrontend> = {
        a: {...createDummyScanFronted(), preSelection: lookupPreselect.a},
        b: {...createDummyScanFronted(), preSelection: lookupPreselect.b},
        e: {...createDummyScanFronted(), preSelection: lookupPreselect.e},
    };
    let component: PreselectionComponent;
    let mocks: MockControlArray;
    let paramManual: PreSelectionParamData<any>;

    beforeEach(function () {
        mocks = buildAllMocks();
        component = new PreselectionComponent(mocks.build.mock, mocks.location.mock, mocks.dialog.mock);
        paramManual = component.params[component.params.length - 1];
    });

    describe('Test init', function () {

        it('should load ids from build service of during init', () => marbleRun(env => {
            mocks.build.control.scan$ = cold('a-', lookupScan);
            const expected$ = cold(          'a-', lookupIds);
            component.ngOnInit();
            expectMarbles(component.ids$, expected$, env);
        }));

        it('should not reload ids after init', () => marbleRun(env => {
            mocks.build.control.scan$ = cold('b-a', lookupScan);
            const expected$ = cold(          'b--', lookupIds);
            component.ngOnInit();
            expectMarbles(component.ids$, expected$, env);
        }));
    });

    describe('Test update of manual', function () {

        function actUpdate<T>(update$, expected$, openDialogFunc: () => void, env): void {
            update$.subscribe(newValue => {
                mocks.dialog.control.afterClosed$ = of(newValue);
                openDialogFunc();
            });
            component.ngOnInit();
            expectMarbles(component.ids$, expected$, env);
        }

        it('should update manual selection settings by select dialog', () => marbleRun(env => {
            mocks.build.control.scan$ = cold('a-', lookupScan);
            const update$ = env.hot(         'a-b-b-a', lookupIds);
            const expected$ = cold(          'a-b---a', lookupIds);
            actUpdate(update$, expected$, () => paramManual.openDialog([]), env);
        }));
    });

    describe('Test reset', function () {
        let lookupReset: MarbleLookup<string>;

        beforeEach(function () {
            mocks.build.control.scan$ = cold('a-', lookupScan);
            lookupReset = {
                m : 'manual',
                c: 'category'
            };
        });

        function actReset<T>(update$, reset$, expected$, openDialogFunc: () => void, env): void {
            update$.subscribe(newValue => {
                mocks.dialog.control.afterClosed$ = of(newValue);
                openDialogFunc();
            });
            reset$.subscribe(attr => {
                component.reset(attr);
            });
            component.ngOnInit();
            expectMarbles(component.ids$, expected$, env);
        }

        it('should reset manual selection', () => marbleRun(env => {
            const update$ = env.hot('a-b-b-a', lookupIds);
            const reset$ = env.hot( '----m--', lookupReset);
            const expected$ = cold( 'a-b-a--', lookupIds);
            actReset(update$, reset$, expected$, () => paramManual.openDialog([]), env);
        }));

        it('should not reset manual selection if reset for category is requested', () => marbleRun(env => {
            const update$ = env.hot('a-b-b-a', lookupIds);
            const reset$ = env.hot( '----c--', lookupReset);
            const expected$ = cold( 'a-b---a', lookupIds);
            actReset(update$, reset$, expected$, () => paramManual.openDialog([]), env);
        }));
    });

    describe('Test content stream', function () {
        const noRestriction = 'No restrictions';

        it(`should show ${noRestriction} if all coins in manual are selected`, () => marbleRun(env => {
            mocks.build.control.scan$ = cold('a-', lookupScan);
            paramManual.content$.subscribe(content => {
                expect(content.info).toEqual(noRestriction);
                expect(content.isValid).toBeTruthy();
            });
            component.ngOnInit();
            env.flush();
        }));

        it(`should not show ${noRestriction} if not all but some coins in manual are selected`, () => marbleRun(env => {
            mocks.build.control.scan$ = cold('b-', lookupScan);
            paramManual.content$.subscribe(content => {
                expect(content.info).not.toEqual(noRestriction);
                expect(content.isValid).toBeTruthy();
            });
            component.ngOnInit();
            env.flush();
        }));

        it('should be invalid if no coins in manual are selected', () => marbleRun(env => {
            mocks.build.control.scan$ = cold('e-', lookupScan);
            paramManual.content$.subscribe(content => {
                expect(content.info).not.toEqual(noRestriction);
                expect(content.isValid).toBeFalse();
            });
            component.ngOnInit();
            env.flush();
        }));
    });

    describe('Test update and return', function () {

        it('should update preselection settings if call update and return', () => marbleRun(env => {
            const spyLocation = spyOn(mocks.location.mock, 'back');
            mocks.build.control.scan$ = cold('a----', lookupScan);
            const update$ = env.hot(         '--b--', lookupIds);
            const save$ = env.hot(           '----x');
            update$.subscribe(newValue => {
                mocks.dialog.control.afterClosed$ = of(newValue);
                paramManual.openDialog([]);
            });
            save$.subscribe(newValue => {
                component.updateAndReturn();
            });
            mocks.build.control.updateParams$.subscribe(updateParams => {
                expect(updateParams.preSelection.manual).toEqual(lookupIds.b);
            });
            component.ngOnInit();
            env.flush();
            expect(spyLocation).toHaveBeenCalledTimes(1);
        }));

        it('should not update is cancel is clicked', () => marbleRun(env => {
            const spyLocation = spyOn(mocks.location.mock, 'back');
            const spyUpdate = spyOn(mocks.build.mock, 'update');
            mocks.build.control.scan$ = cold('a----', lookupScan);
            const update$ = env.hot(         '--b--', lookupIds);
            const save$ = env.hot(           '----x');
            update$.subscribe(newValue => {
                mocks.dialog.control.afterClosed$ = of(newValue);
                paramManual.openDialog([]);
            });
            save$.subscribe(newValue => {
                component.onClickAtAppBar(component.icons.clear);
            });
            component.ngOnInit();
            env.flush();
            expect(spyLocation).toHaveBeenCalledTimes(1);
            expect(spyUpdate).toHaveBeenCalledTimes(0);
        }));
    });

});
