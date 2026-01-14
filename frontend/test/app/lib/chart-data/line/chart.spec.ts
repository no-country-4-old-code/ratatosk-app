import {createCoinHistoryWithMetaData} from '@test/helper-frontend/dummy-data/asset-specific/coin';
import {createDummyFunctionSelected} from '@test/helper-frontend/dummy-data/functions';
import {getTimeRangesFrontend} from '@app/lib/coin/range-frontend/range-frontend';
import {lookupFrontendRange2TimeRange} from '@app/lib/coin/range-frontend/lookup-frontend-range';
import {ChartData} from '@app/lib/chart-data/interfaces';
import {TimeRangeFrontend} from '@app/lib/coin/interfaces';
import {createChartData, getChartArray$} from '@app/lib/chart-data/line/chart';
import {MarbleLookup} from '@test/helper-frontend/marble/lookup';
import {
    createDummyConditionAlwaysFalse,
    createDummyConditionAlwaysTrue
} from '../../../../../../shared-library/src/functions/test-utils/dummy-data/condition';
import {marbleRun} from '@test/helper-frontend/marble/functions.spec';
import {cold} from 'jasmine-marbles';
import {mapTo} from 'rxjs/operators';
import {TimeRange} from '../../../../../../shared-library/src/datatypes/time';
import {Meta} from '../../../../../../shared-library/src/datatypes/meta';
import {History} from '../../../../../../shared-library/src/datatypes/data';
import {getTimeRanges} from '../../../../../../shared-library/src/functions/time/get-time-ranges';
import {ConditionBlueprint} from '../../../../../../shared-library/src/scan/condition/interfaces';

describe('Test create chart-data data', () => {

    describe('Test creation of chart-data data depending on frontend ranges', function () {

        function act(range: TimeRangeFrontend): ChartData {
            const historyWithMeta = createCoinHistoryWithMetaData(42);
            const attr = 'marketCap';
            const funcSelected = [createDummyFunctionSelected()];
            return createChartData(historyWithMeta, attr, range, funcSelected);
        }

        it('should create chart-data data without throwing an error', function () {
            const chartData = act('1W');
            expect(chartData.data.length).toBeGreaterThan(0);
            expect(chartData.colors.length).toEqual(1);
        });

        it('should use higher standard time ranges to calculate samples of extra frontend ranges - one range', function () {
            const result1H = act('1H');
            const result1D = act('1D');
            expect(result1H.colors).toEqual(result1D.colors);
            expect(result1H.data).toEqual(result1D.data.slice(result1D.data.length - 12));
            expect(result1H.data.length).toEqual(12);
        });

        it('should use higher standard time ranges to calculate samples of extra frontend ranges - all ranges', function () {
            const onlyFrontedRanges = getTimeRangesFrontend().filter(r => !getTimeRanges().includes(r as TimeRange));
            onlyFrontedRanges.forEach(range => {
                const higherRange = lookupFrontendRange2TimeRange[range];
                const result = act(range);
                const resultHigherRange = act(higherRange);
                const startIdx = resultHigherRange.data.length - result.data.length;
                expect(result.data).toEqual(resultHigherRange.data.slice(startIdx));
                expect(result.unit).toEqual(resultHigherRange.unit);
                expect(result.colors).toEqual(resultHigherRange.colors);
            });
        });
    });


    describe('Test creation of chart-data data array stream', function () {
        const lookupHistory: MarbleLookup<Meta<History<'coin'>>> = {
            a: createCoinHistoryWithMetaData(42),
            b: createCoinHistoryWithMetaData(43)
        };
        const lookupRange: MarbleLookup<TimeRangeFrontend> = {a: '1H', b: '1Y'};
        const lookupConditions: MarbleLookup<ConditionBlueprint<'coin'>[]> = {
            a: [createDummyConditionAlwaysTrue(), createDummyConditionAlwaysFalse()],
            b: [createDummyConditionAlwaysFalse(), createDummyConditionAlwaysTrue(), createDummyConditionAlwaysFalse()],
            c: []
        };

        it('should return stream with empty array if no conditions are given', () => marbleRun(env => {
            const conditions$ = cold('c-', lookupConditions);
            const history$ = cold('a-', lookupHistory);
            const range$ = cold('a-', lookupRange);
            const expected$ = cold('a-', {a: []});
            const result$ = getChartArray$(conditions$, history$, range$);
            env.expectObservable(result$).toBe(expected$.marbles, expected$.values);
        }));

        it('should update on every update of input', () => marbleRun(env => {
            const conditions$ = cold('a-b-b-a----------------', lookupConditions);
            const history$ = cold('a-------a-b-b-a---------', lookupHistory);
            const range$ = cold('a---------------a-b-b-a', lookupRange);
            const expected$ = cold('a-a-a-a-a-a-a-a-a-a-a-a-');
            const result$ = getChartArray$(conditions$, history$, range$).pipe(mapTo('a'));
            env.expectObservable(result$).toBe(expected$.marbles);
        }));

        it('should always provide chart-data data for every condition (2) and both functions', () => marbleRun(env => {
            const conditions$ = cold('a--', lookupConditions);
            const history$ = cold('ab-', lookupHistory);
            const range$ = cold('a-b', lookupRange);
            getChartArray$(conditions$, history$, range$).subscribe(array => {
                expect(array.length).toEqual(2);
                array.forEach(samples => samples.data.forEach(sample => expect(sample.yCharts.length).toEqual(2)));
            });
            env.flush();
        }));

        it('should always provide chart-data data for every condition (3) and both functions', () => marbleRun(env => {
            const conditions$ = cold('b--', lookupConditions);
            const history$ = cold('ab-', lookupHistory);
            const range$ = cold('a-b', lookupRange);
            getChartArray$(conditions$, history$, range$).subscribe(array => {
                expect(array.length).toEqual(3);
                array.forEach(samples => samples.data.forEach(sample => expect(sample.yCharts.length).toEqual(2)));
            });
            env.flush();
        }));
    });

});
