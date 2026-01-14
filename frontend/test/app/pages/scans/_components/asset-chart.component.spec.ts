import {buildAllMocks, MockControlArray} from '@test/helper-frontend/mocks/all';
import {expectMarbles, marbleRun} from '@test/helper-frontend/marble/functions.spec';
import {cold} from 'jasmine-marbles';
import {
    lookupMarble2Attribute,
    lookupMarble2ParamMap,
    lookupMarble2RangeFrontend,
    MarbleLookup
} from '@test/helper-frontend/marble/lookup';
import {ScanFrontend} from '@lib/scan/interfaces';
import {createDummyScanWithConditions} from '@test/helper-frontend/dummy-data/view';
import {FunctionBlueprint} from '@shared_library/scan/indicator-functions/interfaces';
import {map, tap} from 'rxjs/operators';
import {ColoredFunction} from '@lib/chart-data/interfaces';
import {of} from 'rxjs';
import {createDummyMetaData} from '@shared_library/functions/test-utils/dummy-data/meta';
import {Meta} from '@shared_library/datatypes/meta';
import {History} from '@shared_library/datatypes/data';
import {assetCoin} from '@shared_library/asset/lookup-asset-factory';
import {ConditionBlueprint} from '@shared_library/scan/condition/interfaces';
import {AssetChartComponent} from '@pages_scans/_components/asset-chart/asset-chart.component';


describe('AssetDetailComponent', function () {
    let component: AssetChartComponent;
    let mocks: MockControlArray;

    beforeEach(function () {
        mocks = buildAllMocks();
        component = new AssetChartComponent(mocks.coin.mock, mocks.scan.mock, mocks.route.mock, mocks.location.mock, mocks.role.mock, mocks.userLastSelection.mock);
        component.id = 'bitcoin';
        component.ngOnInit();
    });

    describe('Test stream selected metric', function () {

        it('should start with price (initial user selection)', () => marbleRun(env => {
            const expected$ = cold('p-', lookupMarble2Attribute);
            expectMarbles(component.metricSelected$, expected$, env);
        }));

        it('should start with last user selection', () => marbleRun(env => {
            mocks.userLastSelection.mock.screenAssetChart.metric.coin = 'redditScore';
            component = new AssetChartComponent(mocks.coin.mock, mocks.scan.mock, mocks.route.mock, mocks.location.mock, mocks.role.mock, mocks.userLastSelection.mock);
            component.ngOnInit();
            const expected$ = cold('g-', lookupMarble2Attribute);
            expectMarbles(component.metricSelected$, expected$, env);
        }));

        it('should debounce user input and update on change', () => marbleRun(env => {
            const trigger$ = env.hot('--r 199ms -- r 199ms -- p 199ms --', lookupMarble2Attribute);
            const expected$ = cold('p-- 199ms r- - 199ms -- - 199ms p-', lookupMarble2Attribute);
            trigger$.subscribe(range => component.updateMetric(range));
            expectMarbles(component.metricSelected$, expected$, env);
        }));

        it('should update last user selection on change', () => marbleRun(env => {
            let count = 0;
            const trigger$ = env.hot('--r 199ms -- r 199ms -- p 199ms --', lookupMarble2Attribute);
            const expected$ = cold(  '--- 199ms r- - 199ms -- - 199ms p-', lookupMarble2Attribute);
            trigger$.subscribe(range => component.updateMetric(range));
            expected$.subscribe(range => {
                count++;
                expect(mocks.userLastSelection.mock.screenAssetChart.metric.coin).toEqual(range);
            });
            env.flush();
            expect(count).toEqual(2);
        }));
    });

    describe('Test stream selected time range ', function () {

        it('should start with 1D (initial user selection)', () => marbleRun(env => {
            const expected$ = cold('d-', lookupMarble2RangeFrontend);
            expectMarbles(component.timeRangeSelected$, expected$, env);
        }));

        it('should start with last user selection', () => marbleRun(env => {
            mocks.userLastSelection.mock.screenAssetChart.timeRange = '1Y';
            component = new AssetChartComponent(mocks.coin.mock, mocks.scan.mock, mocks.route.mock, mocks.location.mock, mocks.role.mock, mocks.userLastSelection.mock);
            component.ngOnInit();
            const expected$ = cold('y-', lookupMarble2RangeFrontend);
            expectMarbles(component.timeRangeSelected$, expected$, env);
        }));

        it('should debounce user input and update on change', () => marbleRun(env => {
            const trigger$ = env.hot('- w 199ms - w 199ms - h 199ms --', lookupMarble2RangeFrontend);
            const expected$ = cold(  'd - 199ms w - 199ms - - 199ms h-', lookupMarble2RangeFrontend);
            trigger$.subscribe(range => component.updateTimeRange(range));
            expectMarbles(component.timeRangeSelected$, expected$, env);
        }));

        it('should update last user selection on change', () => marbleRun(env => {
            let count = 0;
            const trigger$ = env.hot('- w 199ms - w 199ms - h 199ms --', lookupMarble2RangeFrontend);
            const expected$ = cold(  '- - 199ms w - 199ms - - 199ms h-', lookupMarble2RangeFrontend);
            trigger$.subscribe(range => component.updateTimeRange(range));
            expected$.subscribe(range => {
                count++;
                expect(mocks.userLastSelection.mock.screenAssetChart.timeRange).toEqual(range);
            });
            env.flush();
            expect(count).toEqual(2);
        }));
    });

    describe('Test stream functions (available and selected)', function () {
        const funcValue1: FunctionBlueprint = {func: 'value', params: {factor: 1}};
        const funcValue2: FunctionBlueprint = {func: 'value', params: {factor: 1.5}};
        const funcValue3: FunctionBlueprint = {func: 'value', params: {factor: 1.5}};
        const funcAverage1: FunctionBlueprint = {func: 'average', params: {factor: 1, scope: 60}};
        const funcAverage2: FunctionBlueprint = {func: 'average', params: {factor: 1, scope: 120}};
        const condition1: ConditionBlueprint<'coin'> = {
            left: funcValue1,
            right: funcValue2,
            compare: '<=',
            metric: 'price'
        };
        const condition2: ConditionBlueprint<'coin'> = {
            left: funcValue2,
            right: funcValue3,
            compare: '>=',
            metric: 'supply'
        };
        const condition3: ConditionBlueprint<'coin'> = {
            left: funcAverage2,
            right: funcAverage1,
            compare: '<',
            metric: 'rank'
        };
        const basicFunctions = [funcValue1];
        const lookupScan: MarbleLookup<ScanFrontend> = {
            a: createDummyScanWithConditions([]),
            b: createDummyScanWithConditions([condition1]),
            c: createDummyScanWithConditions([condition1, condition2]),
            d: createDummyScanWithConditions([condition1, condition2, condition3, condition2, condition3]),
            e: createDummyScanWithConditions([condition3])
        };
        const lookupFunctions: MarbleLookup<FunctionBlueprint[]> = {
            a: basicFunctions,
            b: [...basicFunctions, funcValue2],
            d: [...basicFunctions, funcValue2, funcAverage2, funcAverage1],
            e: [...basicFunctions, funcAverage2, funcAverage1],
        };

        beforeEach(function () {
            mocks.route.control.paramMap$ = cold('a', lookupMarble2ParamMap);
        });

        describe('Test available functions from scan', function () {

            function act(scan$, expected$, env): void {
                spyOn(mocks.scan.mock, 'getScan$').and.returnValue(scan$);
                component.ngOnInit();
                const tested$ = component.functionsAvailable$.pipe(map(array => array.map(container => container.blueprint)));
                expectMarbles(tested$, expected$, env);
            }

            it('should not start with initial value', () => marbleRun(env => {
                const scan$ = cold('--', lookupScan);
                const expected$ = cold('--', lookupFunctions);
                act(scan$, expected$, env);
            }));

            it('should offer standard value function even when no conditions available', () => marbleRun(env => {
                const scan$ = cold('a-', lookupScan);
                const expected$ = cold('a-', lookupFunctions);
                act(scan$, expected$, env);
            }));

            it('should only contain unique functions', () => marbleRun(env => {
                const scan$ = cold('a-b-a-c', lookupScan);
                const expected$ = cold('a-b-a-b', lookupFunctions);
                act(scan$, expected$, env);
            }));

            it('should only trigger if changed', () => marbleRun(env => {
                const scan$ = cold('a-b-b-a', lookupScan);
                const expected$ = cold('a-b---a', lookupFunctions);
                act(scan$, expected$, env);
            }));

            it('should support different functions', () => marbleRun(env => {
                const scan$ = cold('a-b-c-d-e-a', lookupScan);
                const expected$ = cold('a-b---d-e-a', lookupFunctions);
                act(scan$, expected$, env);
            }));
        });

        describe('Test selected functions', function () {
            const funcA: FunctionBlueprint = {func: 'value', params: {factor: 1}};
            const funcB: FunctionBlueprint = {func: 'average', params: {factor: 1, scope: 60}};

            const lookupUpdate: MarbleLookup<ColoredFunction[]> = {
                a: [{blueprint: funcA, color: undefined}],  // add funcA
                b: [{blueprint: funcA, color: '--color-chart-0'}, {blueprint: funcB, color: undefined}], // add funcB
                c: [{blueprint: funcB, color: '--color-chart-1'}], // rmv funcA
                d: [{blueprint: funcB, color: undefined}], // add funcB
                e: [],
            };

            const lookupColoredFunctions: MarbleLookup<ColoredFunction[]> = {
                a: [{blueprint: funcA, color: '--color-chart-0'}],
                b: [{blueprint: funcA, color: '--color-chart-0'}, {blueprint: funcB, color: '--color-chart-1'}],
                c: [{blueprint: funcB, color: '--color-chart-1'}],
                d: [{blueprint: funcB, color: '--color-chart-0'}],
                e: [],
            };

            beforeEach(function () {
                const dummyCoin: Meta<History<'coin'>> = {
                    meta: createDummyMetaData(),
                    payload: assetCoin.createDummyHistory(42)
                };
                spyOn(mocks.coin.mock, 'getCoinHistoryWithMetaData').and.returnValue(of(dummyCoin));
            });

            function act(selected$, expected$, env): void {
                const scan$ = cold('d-', lookupScan);
                spyOn(mocks.scan.mock, 'getScan$').and.returnValue(scan$);
                component = new AssetChartComponent(mocks.coin.mock, mocks.scan.mock, mocks.route.mock, mocks.location.mock, mocks.role.mock, mocks.userLastSelection.mock);
                component.ngOnInit();
                selected$.subscribe(blueprints => component.selectFunctions(blueprints));
                expectMarbles(component.functionsSelected$.pipe(tap(x => console.log('Miau ', x))), expected$, env);
            }

            it('should start with standard value function selected (initial user selection)', () => marbleRun(env => {
                const selected$ = env.hot('--', lookupUpdate);
                const expected$ = cold(   'a-', lookupColoredFunctions);
                act(selected$, expected$, env);
            }));

            it('should start with user selection', () => marbleRun(env => {
                mocks.userLastSelection.mock.screenAssetChart.coloredFunctions = lookupColoredFunctions.b;
                const selected$ = env.hot('--', lookupUpdate);
                const expected$ = cold(   'b-', lookupColoredFunctions);   // start with
                act(selected$, expected$, env);
            }));

            it('should handle empty initial user selection', () => marbleRun(env => {
                mocks.userLastSelection.mock.screenAssetChart.coloredFunctions = [];
                const selected$ = env.hot('--', lookupUpdate);
                const expected$ = cold('e-', lookupColoredFunctions);
                act(selected$, expected$, env);
            }));

            it('should ignore not available functions in initial user selection', () => marbleRun(env => {
                const blueprintNotAvailable: FunctionBlueprint = {func: 'value', params: {factor: 1.616}};
                const coloredFuncNotAvailable: ColoredFunction = {blueprint: blueprintNotAvailable, color: undefined};
                mocks.userLastSelection.mock.screenAssetChart.coloredFunctions = [coloredFuncNotAvailable, ...lookupColoredFunctions.a];
                const selected$ = env.hot('--', lookupUpdate);
                const expected$ = cold('a-', lookupColoredFunctions);
                act(selected$, expected$, env);
            }));

            it('should dye functions (done in chart-lib)', () => marbleRun(env => {
                // almost everything is done in chart lib and tested there
                const selected$ = env.hot('- b 199ms - c 199ms - d 199ms -', lookupUpdate);
                const expected$ = cold('a - 199ms b - 199ms c - 199ms d', lookupColoredFunctions);
                act(selected$, expected$, env);
            }));

            it('should update last user selection on change', () => marbleRun(env => {
                // almost everything is done in chart lib and tested there
                let count = 0;
                const selected$ = env.hot('- b 199ms - c 199ms - d 199ms -', lookupUpdate);
                const expected$ = cold(   '- - 199ms b - 199ms c - 199ms d', lookupColoredFunctions);
                const scan$ = cold(       'd-', lookupScan);
                spyOn(mocks.scan.mock, 'getScan$').and.returnValue(scan$);
                component = new AssetChartComponent(mocks.coin.mock, mocks.scan.mock, mocks.route.mock, mocks.location.mock, mocks.role.mock, mocks.userLastSelection.mock);
                component.ngOnInit();
                selected$.subscribe(blueprints => component.selectFunctions(blueprints));
                expected$.subscribe(coloredFuncs => {
                    count++;
                    const blueprintsFunc = coloredFuncs.map(c => c.blueprint);
                    const blueprintsLastSelection = mocks.userLastSelection.mock.screenAssetChart.coloredFunctions.map(c => c.blueprint);
                    expect(blueprintsLastSelection).toEqual(blueprintsFunc);
                });
                env.flush();
                expect(count).toEqual(3);
            }));
        });
    });
});
