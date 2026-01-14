import {BuildScanMenuComponent} from '@app/pages/build-scan/main-menu/build-scan-menu.component';
import {buildAllMocks, MockControlArray} from '@test/helper-frontend/mocks/all';
import {marbleRun} from '@test/helper-frontend/marble/functions.spec';
import {cold} from 'jasmine-marbles';
import {
    lookupMarble2Boolean,
    lookupMarble2Numbers,
    lookupMarble2PermissionCheckResult,
    MarbleLookup
} from '@test/helper-frontend/marble/lookup';
import {
    createDummyScanFronted,
    createDummyScanNotification,
    createDummyScanWithConditions
} from '@test/helper-frontend/dummy-data/view';
import {ScanFrontend} from '@app/lib/scan/interfaces';
import {Observable, of} from 'rxjs';
import {AssetIdCoin, MetricCoinHistory} from '../../../../../shared-library/src/asset/assets/coin/interfaces';
import {BuildCategory, BuildError} from '@app/lib/build/plausibility-checks';
import {lookupCoinInfo} from '../../../../../shared-library/src/asset/assets/coin/helper/lookup-coin-info-basic';
import {map, shareReplay} from 'rxjs/operators';
import {
    createDummyConditionAlwaysFalse,
    createDummyConditionAlwaysTrue
} from '../../../../../shared-library/src/functions/test-utils/dummy-data/condition';
import {Scan} from '../../../../../shared-library/src/scan/interfaces';
import {ContentCategory} from '@app/pages/build-scan/_components/card-category/category-card.component';
import {assetCoin} from '../../../../../shared-library/src/asset/lookup-asset-factory';
import {ConditionBlueprint} from '../../../../../shared-library/src/scan/condition/interfaces';
import {PreSelectionBlueprint} from '@shared_library/scan/pre-selection/interfaces';

describe('Test BuildScanComponent', () => {
    const lookupErrors: MarbleLookup<any> = {
        'a': [{msg: 'a'}], 'b': [{msg: 'a'}, {msg: 'b'}], 'e': []
    };
    const lookupRoute: MarbleLookup<any> = {
        'a': {get: tmp => '0'}, 'b': {get: tmp => '1'}, 'c': {get: tmp => NaN},
    };
    let defaultBlueprint: PreSelectionBlueprint<'coin'>;
    let component: BuildScanMenuComponent;
    let mocks: MockControlArray;

    beforeEach(function () {
        mocks = buildAllMocks();
        mocks.build.control.error$ = of([]).pipe(shareReplay(1));
        mocks.role.control.permission$ = of(lookupMarble2PermissionCheckResult.t).pipe(shareReplay(1));
        component = new BuildScanMenuComponent(mocks.build.mock, mocks.dialog.mock, mocks.location.mock,
            mocks.route.mock, mocks.router.mock, null, mocks.role.mock, mocks.user.mock, mocks.buildConditions.mock);
        defaultBlueprint = assetCoin.createDefaultPreSelection();
    });

    describe('Test stream is scan invalid', function () {

        function act(buildError$, permission$, expected$, env): void {
            mocks.route.control.paramMap$ = cold('a', lookupRoute);
            mocks.build.control.error$ = buildError$;
            mocks.role.control.permission$ = permission$;
            env.expectObservable(component.isScanInvalid$).toBe(expected$.marbles, expected$.values);
        }

        it('should be true if at least one error msg is given', () => marbleRun(env => {
            const error$ = cold('e-a-----e--', lookupErrors);
            const permission$ = cold('t---f-t---f', lookupMarble2PermissionCheckResult);
            const expected$ = cold('f-t-----f-t', lookupMarble2Boolean);
            act(error$, permission$, expected$, env);
        }));
    });

    describe('Test stream error msg', function () {

        beforeEach(function () {
            mocks.route.control.paramMap$ = cold('c', lookupRoute);
        });

        function act(buildError$, permission$, expected$, env): void {
            mocks.build.control.error$ = buildError$;
            mocks.role.control.permission$ = permission$;
            env.expectObservable(component.errorMsgAll$).toBe(expected$.marbles, expected$.values);
        }

        it('should update when error msg changed', () => marbleRun(env => {
            const error$ = cold('a-b-b-a--e', lookupErrors);
            const permission$ = cold('t---------', lookupMarble2PermissionCheckResult);
            const expected$ = cold('a-b---a--e', {a: ['a'], b: ['a', 'b'], e: []});
            act(error$, permission$, expected$, env);
        }));

        it('should update when permission msg changed', () => marbleRun(env => {
            const error$ = cold('e------', lookupErrors);
            const permission$ = cold('t-f-f-t', lookupMarble2PermissionCheckResult);
            const expected$ = cold('e-f---e', {f: ['f'], e: []});
            act(error$, permission$, expected$, env);
        }));

        it('should also work for action "modify scan"', () => marbleRun(env => {
            mocks.route.control.paramMap$ = cold('a', lookupRoute);
            const error$ = cold('e------', lookupErrors);
            const permission$ = cold('t-f-f-t', lookupMarble2PermissionCheckResult);
            const expected$ = cold('e-f---e', {f: ['f'], e: []});
            act(error$, permission$, expected$, env);
        }));

        it('should call permission with actions depending on route', () => marbleRun(env => {
            mocks.route.control.paramMap$ = cold('c--b--a--b--c', lookupRoute);
            mocks.build.control.error$ = cold('e', lookupErrors);
            mocks.role.control.permission$ = cold('t', lookupMarble2PermissionCheckResult);
            component.errorMsgAll$.subscribe();
            env.flush();
            expect(mocks.role.control.permissionParams).toEqual(['addScan', 'modifyScan', 'modifyScan', 'modifyScan', 'addScan']);
        }));

        it('should combine error and permission', () => marbleRun(env => {
            const error$ = cold('a---b-a--', lookupErrors);
            const permission$ = cold('t-f-----t', lookupMarble2PermissionCheckResult);
            const expected$ = cold('a-c-d-c-a', {a: ['a'], c: ['a', 'f'], d: ['a', 'b', 'f']});
            act(error$, permission$, expected$, env);
        }));
    });

    describe('Test clear and return', function () {

        function act(expectedCallsReset: number, expectedCallsBack: number) {
            const spyOnBuildReset = spyOn(mocks.build.mock, 'reset');
            const spyOnLocationBack = spyOn(mocks.location.mock, 'back');
            component.onClickAtAppBar(component.icons.clear);
            expect(spyOnBuildReset).toHaveBeenCalledTimes(expectedCallsReset);
            expect(spyOnLocationBack).toHaveBeenCalledTimes(expectedCallsBack);
        }

        it('should return if no changes exist', function () {
            mocks.build.control.hasChanged = false;
            act(0, 1);
        });

        it('should reset & return if changes exists and dialog is confirmed', function () {
            mocks.build.control.hasChanged = true;
            mocks.dialog.control.afterClosed$ = of(true);
            act(1, 1);
        });

        it('should cancel if changes exists and dialog is not confirmed', function () {
            mocks.build.control.hasChanged = true;
            mocks.dialog.control.afterClosed$ = of(false);
            act(0, 0);
        });
    });

    describe('Test save and return', function () {

        function act(expectedCallsSaveIdx: number[]) {
            const spyOnBuildSave = spyOn(mocks.build.mock, 'save').and.returnValue(of(2));
            const spyOnBuildReset = spyOn(mocks.build.mock, 'reset');
            const spyOnNavigateBack = spyOn(mocks.router.mock, 'navigate');
            // start - bypass loading dialog
            spyOn(component.dialog, 'open').and.callFake((comp, config: any) => {
                return {afterClosed: () => config.data.stream$} as any;
            });
            // end - bypass loading dialog
            (component['route'] as any).parent = {parent: {parent: 'foo'}};
            component.onClickAtFab();
            expect(spyOnBuildSave).toHaveBeenCalledWith(...expectedCallsSaveIdx);
            expect(spyOnBuildSave).toHaveBeenCalledTimes(1);
            expect(spyOnBuildReset).toHaveBeenCalledTimes(1);
            expect(spyOnNavigateBack).toHaveBeenCalledTimes(1);
        }

        it('should call save with index of route ( 0 )', function () {
            mocks.route.control.paramMap$ = of(lookupRoute.a);
            act([0]);
        });

        it('should call save with index of route ( 1 )', function () {
            mocks.route.control.paramMap$ = of(lookupRoute.b);
            act([1]);
        });

        it('should call save with without index of route', function () {
            mocks.route.control.paramMap$ = of(lookupRoute.c);
            act([]);
        });
    });

    describe('Test dialog', function () {

        function runDialogTest<T>(result$: Observable<T>, lookup: MarbleLookup<T>, openDialogFunc: () => void, env): void {
            const update$ = env.hot('-a-b-c', lookup);
            const expected$ = cold('-a-b-c', lookup);
            update$.subscribe(newValue => {
                mocks.dialog.control.afterClosed$ = of(newValue);
                openDialogFunc();
            });
            env.expectObservable(result$).toBe(expected$.marbles, expected$.values);
        }

        it('should update icon by dialog', () => marbleRun(env => {
            const result$: Observable<number> = mocks.build.control.updateParams$.pipe(
                map(partial => partial.iconId));
            runDialogTest(result$, lookupMarble2Numbers, () => component.openDialogIcon(), env);
        }));

        it('should update preselection settings by copy dialog', () => marbleRun(env => {
            const result$: Observable<Partial<Scan>> = mocks.build.control.updateParams$;
            const lookup: MarbleLookup<Partial<Scan>> = {
                a: {preSelection: {...defaultBlueprint, manual: ['id0']}},
                b: {preSelection: {...defaultBlueprint, manual: ['id1', 'id0']}},
                c: {preSelection: {...defaultBlueprint, manual: ['id1']}},
            };
            runDialogTest(result$, lookup, () => component.openDialogPreselectionCopy(), env);
        }));

        it('should update conditions by copy dialog', () => marbleRun(env => {
            const result$: Observable<Partial<Scan>> = mocks.build.control.updateParams$;
            const lookup: MarbleLookup<Partial<Scan>> = {
                a: {conditions: []},
                b: {conditions: [createDummyConditionAlwaysTrue()]},
                c: {conditions: [createDummyConditionAlwaysTrue(), createDummyConditionAlwaysFalse()]},
            };
            runDialogTest(result$, lookup, () => component.openDialogConditionsCopy(), env);
        }));
    });


    describe('Test content streams', function () {
        const categories: BuildCategory[] = ['Icon', 'Title', 'Preselection', 'Conditions', 'Notification'];

        function runChangeTest(content$: Observable<ContentCategory>, lookupView: MarbleLookup<ScanFrontend>, lookupText: MarbleLookup<string>, env: any): void {
            mocks.build.control.scan$ = cold('a-b-b-c-d-e-', lookupView);
            const expected$ = cold('-a-b---c-d-e', lookupText);
            const text$ = content$.pipe(map(result => result.info));
            env.expectObservable(text$).toBe(expected$.marbles, expected$.values);
        }

        function runValidTest(content$: Observable<ContentCategory>, lookupView: MarbleLookup<ScanFrontend>, lookupText: MarbleLookup<string>, env: any): void {
            mocks.build.control.scan$ = cold('a-b-c-d-e-', lookupView);
            const expected$ = cold('-t-t-t-t-t', lookupMarble2Boolean);
            const text$ = content$.pipe(map(result => result.isValid));
            env.expectObservable(text$).toBe(expected$.marbles, expected$.values);
        }

        function runErrorInOwnCategoryTest(content$: Observable<ContentCategory>, lookupView: MarbleLookup<ScanFrontend>, ownCategory: BuildCategory, env: any): void {
            const error: BuildError = {category: ownCategory, msg: 'some error'};
            mocks.build.control.error$ = of([error]).pipe(shareReplay(1));
            mocks.build.control.scan$ = cold('a-b-c-', lookupView);
            const expected$ = cold('-f----', {f: 'here is an error'});
            const text$ = content$.pipe(map(result => result.info));
            env.expectObservable(text$).toBe(expected$.marbles, expected$.values);
        }

        function runErrorInOtherCategoryTest(content$: Observable<ContentCategory>, lookupView: MarbleLookup<ScanFrontend>, lookupText: MarbleLookup<string>,
                                             otherCategory: BuildCategory, env: any): void {
            const error: BuildError = {category: otherCategory, msg: 'some error'};
            mocks.build.control.error$ = of([error]).pipe(shareReplay(1));
            mocks.build.control.scan$ = cold('a-b-c-', lookupView);
            const expected$ = cold('-a-b-c', lookupText);
            const text$ = content$.pipe(map(result => result.info));
            env.expectObservable(text$).toBe(expected$.marbles, expected$.values);
        }


        describe('Test stream content icon', function () {
            const lookupView: MarbleLookup<ScanFrontend> = {
                a: createViewWithIcon('a'),
                b: createViewWithIcon('b'),
            };

            function createViewWithIcon(iconPath: string): ScanFrontend {
                return {...createDummyScanFronted(), ...{iconPath}};
            }

            it('should change when build scan stream changed', () => marbleRun(env => {
                mocks.build.control.scan$ = cold('a-b-b-a', lookupView);
                const expected$ = cold('a-b---a');
                env.expectObservable(component.contentIcon$).toBe(expected$.marbles, expected$.values);
            }));
        });

        describe('Test stream content preselection', function () {
            const category: BuildCategory = 'Preselection';
            const lookupView: MarbleLookup<ScanFrontend> = {
                a: createViewWithPreselection(['id0']),
                b: createViewWithPreselection(['id1']),
                c: createViewWithPreselection(['id0', 'id1', 'id2']),
                d: createViewWithPreselection(['id42', 'id0', 'id1', 'id2']),
                e: createViewWithPreselection(assetCoin.getIds())
            };

            const lookupText: MarbleLookup<string> = {
                a: lookupCoinInfo['id0'].symbol,
                b: lookupCoinInfo['id1'].symbol,
                c: `${lookupCoinInfo['id0'].symbol}, ${lookupCoinInfo['id1'].symbol}, ${lookupCoinInfo['id2'].symbol}`,
                d: `${lookupCoinInfo['id42'].symbol}, ${lookupCoinInfo['id0'].symbol}, ${lookupCoinInfo['id1'].symbol}, ${lookupCoinInfo['id2'].symbol}`,
                e: 'all coins',
            };

            function createViewWithPreselection(ids: AssetIdCoin[]): ScanFrontend {
                return {
                    ...createDummyScanFronted(),
                    preSelection: {...assetCoin.createDefaultPreSelection(), manual: ids}
                };
            }

            it('should update preselection text on change', () => marbleRun(env => {
                runChangeTest(component.contentPreselection$, lookupView, lookupText, env);
            }));

            it('should be valid', () => marbleRun(env => {
                runValidTest(component.contentPreselection$, lookupView, lookupText, env);
            }));

            it('should show error msg if there is an build error for notification', () => marbleRun(env => {
                runErrorInOwnCategoryTest(component.contentPreselection$, lookupView, category, env);
            }));

            it('should show normal msg if there is an build error for other category', () => marbleRun(env => {
                categories.filter(cat => cat !== category).forEach(cat => {
                    runErrorInOtherCategoryTest(component.contentPreselection$, lookupView, lookupText, cat, env);
                });
            }));
        });

        describe('Test stream content conditions', function () {
            const category: BuildCategory = 'Conditions';
            const lookupView: MarbleLookup<ScanFrontend> = {
                a: createViewWithAttr([]),
                b: createViewWithAttr(['price']),
                c: createViewWithAttr(['rank']),
                d: createViewWithAttr(['price', 'rank']),
                e: createViewWithAttr(['price', 'rank', 'rank', 'volume'])
            };

            const lookupText = {
                a: 'no conditions',
                b: '1 condition (price)',
                c: '1 condition (rank)',
                d: '2 conditions (price, rank)',
                e: '4 conditions (price, rank, rank, volume)',
            };

            function createViewWithAttr(attributes: MetricCoinHistory[]): ScanFrontend {
                const conditions: ConditionBlueprint<'coin'>[] = attributes.map(attribute =>
                    ({...createDummyConditionAlwaysTrue(), metric: attribute}));
                return createDummyScanWithConditions(conditions);
            }

            it('should update conditions setting text on change', () => marbleRun(env => {
                runChangeTest(component.contentConditions$, lookupView, lookupText, env);
            }));

            it('should be valid', () => marbleRun(env => {
                runValidTest(component.contentConditions$, lookupView, lookupText, env);
            }));

            it('should show error msg if there is an build error for notification', () => marbleRun(env => {
                runErrorInOwnCategoryTest(component.contentConditions$, lookupView, category, env);
            }));

            it('should show normal msg if there is an build error for other category', () => marbleRun(env => {
                categories.filter(cat => cat !== category).forEach(cat => {
                    runErrorInOtherCategoryTest(component.contentConditions$, lookupView, lookupText, cat, env);
                });
            }));
        });

        describe('Test stream content notification settings', function () {
            const category: BuildCategory = 'Notification';
            const lookupScan: MarbleLookup<ScanFrontend> = {
                a: createScanWithSettings(true),
                b: createScanWithSettings(false),
                c: createScanWithSettings(true),
                d: createScanWithSettings(false),
                e: createScanWithSettings(true),
            };
            const lookupText = {
                a: 'new coin detected',
                b: 'never',
                c: 'new coin detected',
                d: 'never',
                e: 'new coin detected',
            };

            function createScanWithSettings(isNotificationEnabled: boolean): ScanFrontend {
                const notification = createDummyScanNotification(isNotificationEnabled);
                return {...createDummyScanFronted(), notification};
            }

            it('should update notification settings text on change', () => marbleRun(env => {
                runChangeTest(component.contentNotify$, lookupScan, lookupText, env);
            }));

            it('should be valid', () => marbleRun(env => {
                runValidTest(component.contentNotify$, lookupScan, lookupText, env);
            }));

            it('should show error msg if there is an build error for notification', () => marbleRun(env => {
                runErrorInOwnCategoryTest(component.contentNotify$, lookupScan, category, env);
            }));

            it('should show normal msg if there is an build error for other category', () => marbleRun(env => {
                categories.filter(cat => cat !== category).forEach(cat => {
                    runErrorInOtherCategoryTest(component.contentNotify$, lookupScan, lookupText, cat, env);
                });
            }));
        });

    });

});
