import {ConditionsComponent} from '@app/pages/build-scan/conditions-menu/conditions.component';
import {buildAllMocks, MockControlArray} from '@test/helper-frontend/mocks/all';
import {expectMarbles, marbleRun} from '@test/helper-frontend/marble/functions.spec';
import {Observable, of} from 'rxjs';
import {createCoinHistoryWithMetaData} from '@test/helper-frontend/dummy-data/asset-specific/coin';
import {createDummyScanWithConditions} from '@test/helper-frontend/dummy-data/view';
import {filter, map} from 'rxjs/operators';
import {cold} from 'jasmine-marbles';
import {
    lookupMarble2Boolean,
    lookupMarble2CoinId,
    lookupMarble2Numbers,
    lookupMarble2RangeFrontend,
    MarbleLookup
} from '@test/helper-frontend/marble/lookup';
import {
    createDummyConditionSpecific
} from '../../../../../shared-library/src/functions/test-utils/dummy-data/condition';
import {ScanFrontend} from '@app/lib/scan/interfaces';
import {TimeRange} from '../../../../../shared-library/src/datatypes/time';
import {FunctionOption} from '../../../../../shared-library/src/scan/indicator-functions/interfaces';
import {ConditionBlueprint} from '../../../../../shared-library/src/scan/condition/interfaces';

xdescribe('ConditionsComponent', () => {
    const coinHistoryWithMetaData = createCoinHistoryWithMetaData(42);
    const func: FunctionOption = 'value';
    const conditionTrue: ConditionBlueprint<'coin'> = createDummyConditionSpecific(func, {factor: 0.5}, '<', func, {factor: 1});
    const conditionFalse: ConditionBlueprint<'coin'> = createDummyConditionSpecific(func, {factor: 1}, '>', func, {factor: 2});
    const lookupConditions: MarbleLookup<ConditionBlueprint<'coin'>[]> = {
        a: [conditionTrue, conditionFalse],
        t: [conditionTrue, conditionTrue],
        f: [conditionFalse, conditionFalse],
        e: []
    };
    const lookupScan: MarbleLookup<ScanFrontend> = {
        a: createDummyScanWithConditions(lookupConditions.a),
        t: createDummyScanWithConditions(lookupConditions.t),
        f: createDummyScanWithConditions(lookupConditions.f)
    };
    let component: ConditionsComponent;
    let mocks: MockControlArray;

    beforeEach(function () {
        mocks = buildAllMocks();
        mocks.coin.control.history$ = cold('a', {a: coinHistoryWithMetaData});
        mocks.build.control.scan$ = cold('a', lookupScan);
        component = new ConditionsComponent(mocks.build.mock, null, mocks.coin.mock, mocks.dialog.mock, mocks.userLastSelection.mock);
    });

    describe('Test initial conditions stream', function () {

        it('should use conditions of scan under construction as initial', () => marbleRun(env => {
            mocks.build.control.scan$ = cold('a-', lookupScan);
            const expected$ = cold('a-', lookupConditions);
            env.expectObservable(component.initialConditions$).toBe(expected$.marbles, expected$.values);
        }));

        it('should update initial conditions if conditions of scan under construction changed', () => marbleRun(env => {
            mocks.build.control.scan$ = cold('a-t-t-a-f-', lookupScan);
            const expected$ = cold('a-t---a-f', lookupConditions);
            env.expectObservable(component.initialConditions$).toBe(expected$.marbles, expected$.values);
        }));
    });

    describe('Test chart-data data stream', function () {
        const range: TimeRange = '1D';
        let lookupLeftValue: MarbleLookup<number>;

        beforeEach(function () {
            lookupLeftValue = {
                t: conditionTrue.left.params.factor * coinHistoryWithMetaData.payload.price[range][0],
                f: conditionTrue.right.params.factor * coinHistoryWithMetaData.payload.price[range][0]
            };
        });

        function act(condition$: any, idx$: any): Observable<number> {
            condition$.subscribe(cond => component.updateConditions(cond));
            idx$.subscribe(idx => component.updateSelectedIdx(idx));
            return component.chart$.pipe(
                filter(chart => chart !== undefined),
                map(chart => chart.data[0].yCharts[0]));
        }

        it('check test env (use different factors of conditions for identification in chart-data data)', () => marbleRun(env => {
            expect(conditionTrue.left.params.factor).not.toEqual(conditionTrue.right.params.factor);
            expect(lookupLeftValue.t).not.toEqual(lookupLeftValue.f);
        }));

        it('should start with chart data given from scan build service', () => marbleRun(env => {
            mocks.build.control.scan$ = cold('a-', lookupScan);
            const expected$ = cold('t', lookupLeftValue);
            const firstLeftValue$ =  component.chart$.pipe(
                filter(chart => chart !== undefined),
                map(chart => chart.data[0].yCharts[0]));
            component.ngOnInit();
            expectMarbles(firstLeftValue$, expected$, env);
        }));

        it('should update chart-data when conditions updated', () => marbleRun(env => {
            const condition$ = env.hot('a-t-f-f-t', lookupConditions);
            const idx$ = env.hot('a--------', lookupMarble2Numbers);
            const expected$ = cold('t-t-f-f-t', lookupLeftValue);
            const firstLeftValue$ = act(condition$, idx$);
            expectMarbles(firstLeftValue$, expected$, env);
        }));

        it('should start with selection of first element as default', () => marbleRun(env => {
            const condition$ = env.hot('a-', lookupConditions);
            const idx$ = env.hot('--', lookupMarble2Numbers);
            const expected$ = cold('t-', lookupLeftValue);
            const firstLeftValue$ = act(condition$, idx$);
            expectMarbles(firstLeftValue$, expected$, env);
        }));

        it('should update chart-data when selection changed (overflow protected by modulo)', () => marbleRun(env => {
            const condition$ = env.hot('a----------', lookupConditions);
            const idx$ = env.hot('a-b-c-d-e-f', lookupMarble2Numbers);
            const expected$ = cold('t-f-t-f-t-f', lookupLeftValue);
            const firstLeftValue$ = act(condition$, idx$);
            expectMarbles(firstLeftValue$, expected$, env);
        }));

        it('should have undefined chart data if no conditions there', () => marbleRun(env => {
            const condition$ = env.hot('a-e-e-a-', lookupConditions);
            const idx$ = env.hot('a-------', lookupMarble2Numbers);
            const isDefined$ = cold('t-f-f-t-', lookupMarble2Boolean);
            condition$.subscribe(cond => component.updateConditions(cond));
            idx$.subscribe(idx => component.updateSelectedIdx(idx));
            const defined$ = component.chart$.pipe(map(chart => chart !== undefined));
            expectMarbles(defined$, isDefined$, env);
        }));
    });

    describe('Test bool sample array stream', function () {
        const lookupBoolArray: MarbleLookup<boolean[]> = {a: [true, false], t: [true, true], f: [false, false]};

        it('should start with conditions of scan build service as init (take only 1)', () => marbleRun(env => {
            mocks.build.control.scan$ = cold('t-f--', lookupScan);
            const expected$ = cold(          '-t---', lookupBoolArray);
            const result$ = component.chartBoolArray$.pipe(
                map(array => array.map(samples => samples.every(s => s.y))),
            );
            component.ngOnInit();
            expectMarbles(result$, expected$, env);
        }));

        it('should update stream when conditions updated', () => marbleRun(env => {
            const condition$ = env.hot('a-t-f-f-t-', lookupConditions);
            const expected$ = cold('-a-t-f-f-t', lookupBoolArray);
            const result$ = component.chartBoolArray$.pipe(
                map(array => array.map(samples => samples.every(s => s.y))),
            );
            condition$.subscribe(cond => component.updateConditions(cond));
            expectMarbles(result$, expected$, env);
        }));
    });

    describe('Test global bool sample stream', function () {

        function act(condition$, expected$, env): void {
            const result$ = component.chartBool$.pipe(map(samples => samples.every(s => s.y)));
            condition$.subscribe(cond => component.updateConditions(cond));
            expectMarbles(result$, expected$, env);
        }

        it('should start with conditions of scan build service as init', () => marbleRun(env => {
            mocks.build.control.scan$ = cold('t-', lookupScan);
            const condition$ = env.hot(      '--', lookupConditions);
            const expected$ = cold(          '-t', lookupMarble2Boolean);
            component.ngOnInit();
            act(condition$, expected$, env);
        }));

        it('should update stream when conditions updated', () => marbleRun(env => {
            const condition$ = env.hot('t-a-f-f-a-t-', lookupConditions);
            const expected$ = cold('-t-f-f-f-f-t', lookupMarble2Boolean);
            act(condition$, expected$, env);
        }));
    });

    describe('Test selected function idx$', function () {
        const lookup = {...lookupMarble2Numbers, ...{u: undefined}};

        it('should start with undefined (undefined means no function is selected)', () => marbleRun(env => {
            const expected$ = cold('u-', lookup);
            expectMarbles(component.selectedFunctionIdx$, expected$, env);
        }));

        it('should update stream', () => marbleRun(env => {
            const update$ = env.hot('--a-b-b-a-u', lookup);
            const expected$ = cold('u-a-b-b-a-u', lookup);
            update$.subscribe(idx => component.updateSelectedFunctionIdx(idx));
            expectMarbles(component.selectedFunctionIdx$, expected$, env);
        }));
    });

    describe('Test range$', function () {

        it('should start with 12H (default user selection)', () => marbleRun(env => {
            const expected$ = cold('i-', lookupMarble2RangeFrontend);
            env.expectObservable(component.range$).toBe(expected$.marbles, expected$.values);
        }));

        it('should start with last user selection', () => marbleRun(env => {
            mocks.userLastSelection.mock.screenConditionMenu.timeRange = '1M';
            component = new ConditionsComponent(mocks.build.mock, null, mocks.coin.mock, mocks.dialog.mock, mocks.userLastSelection.mock);
            const expected$ = cold('m-', lookupMarble2RangeFrontend);
            env.expectObservable(component.range$).toBe(expected$.marbles, expected$.values);
        }));

        it('should update stream by dialog if changed', () => marbleRun(env => {
            const update$ = env.hot('--i-d-d-i', lookupMarble2RangeFrontend);
            const expected$ = cold( 'i---d---i', lookupMarble2RangeFrontend);
            update$.subscribe(range => {
                mocks.dialog.control.afterClosed$ = of(range);
                component.openDialogSelectTimeRange();
            });
            env.expectObservable(component.range$).toBe(expected$.marbles, expected$.values);
        }));

        it('should update last user selection on change', () => marbleRun(env => {
            let count = 0;
            const update$ = env.hot('-i-d-d-i-', lookupMarble2RangeFrontend);
            const expected$ = cold( '----d---i', lookupMarble2RangeFrontend);
            update$.subscribe(range => {
                mocks.dialog.control.afterClosed$ = of(range);
                component.openDialogSelectTimeRange();
            });
            expected$.subscribe(range => {
                count++;
                expect(mocks.userLastSelection.mock.screenConditionMenu.timeRange).toEqual(range);
            });
            env.flush();
            expect(count).toEqual(2);
        }));

    });

    describe('Test stream of coin id', function () {
        const idBitcoin = 'bitcoin';
        const idEthereum = 'ethereum';
        const lookup = {...lookupMarble2CoinId, a: idBitcoin, e: idEthereum};

        it(`should start with id of bitcoin (which is ${idBitcoin} and default user selection)`, () => marbleRun(env => {
            const expected$ = cold('a-', lookup);
            env.expectObservable(component.coinId$).toBe(expected$.marbles, expected$.values);
        }));

        it('should start with last user selection', () => marbleRun(env => {
            mocks.userLastSelection.mock.screenConditionMenu.assetId.coin = idEthereum;
            component = new ConditionsComponent(mocks.build.mock, null, mocks.coin.mock, mocks.dialog.mock, mocks.userLastSelection.mock);
            const expected$ = cold('e-', lookup);
            env.expectObservable(component.coinId$).toBe(expected$.marbles, expected$.values);
        }));

        it('should update stream by dialog if changed', () => marbleRun(env => {
            const update$ = env.hot('--a-b-b-a-c', lookup);
            const expected$ = cold('a---b---a-c', lookup);
            update$.subscribe(id => {
                mocks.dialog.control.afterClosed$ = of(id);
                component.openDialogSelectCoin();
            });
            env.expectObservable(component.coinId$).toBe(expected$.marbles, expected$.values);
        }));

        it('should update last user selection on change', () => marbleRun(env => {
            let count = 0;
            const update$ = env.hot('a-b-b-a-c', lookup);
            const expected$ = cold( '---b---a-c', lookup);
            update$.subscribe(id => {
                mocks.dialog.control.afterClosed$ = of(id);
                component.openDialogSelectCoin();
            });
            expected$.subscribe(id => {
                count++;
                expect(mocks.userLastSelection.mock.screenConditionMenu.assetId.coin).toEqual(id);
            });
            env.flush();
            expect(count).toEqual(3);
        }));
    });

});
