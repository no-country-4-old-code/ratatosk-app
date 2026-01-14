import {buildChartData, createChartDataSamples, createTimeLabels} from '@app/lib/chart-data/line/chart-data/chart-data';
import {TimeRange} from '../../../../../../../shared-library/src/datatypes/time';
import {MetaData} from '../../../../../../../shared-library/src/datatypes/meta';
import {ChartLineSample} from '@app/lib/chart-data/interfaces';
import {lookupStepWidthInMinutesOfRange} from '../../../../../../../shared-library/src/settings/sampling';
import {createDummyMetaData} from '../../../../../../../shared-library/src/functions/test-utils/dummy-data/meta';
import {chartColors} from '@app/lib/chart-data/line/color/dye-functions';
import {createRangeArray} from '../../../../../../../shared-library/src/functions/general/array';
import {getTimeRanges} from '../../../../../../../shared-library/src/functions/time/get-time-ranges';


describe('Test creation of overall chart data', function () {
    const range: TimeRange = '1D';
    const meta: MetaData = createDummyMetaData();
    meta.timestampMs = new Date().getTime();
    const func = (values: number[][]) => buildChartData(values, range, meta, chartColors);

    describe('Test basics', function () {

        it('should throw no error if no values are given', function () {
            const result = func([]);
            expect(result.data).toEqual([]);
            expect(result.colors).toEqual([]);
            expect(result.unit).toEqual(meta.unit);
        });

        it('should handle y-values of different length and return latest sample as last', function () {
            const result = func([[1], [20, 10]]);
            expect(result.data.map(sample => sample.yCharts)).toEqual([[NaN, 10], [1, 20]]);
        });

        it('should have never more colors then given y-value-rows', function () {
            expect(func([[1]]).colors.length).toEqual(1);
            expect(func([[1], [20, 10]]).colors.length).toEqual(2);
            expect(func([[1], [0], [1]]).colors.length).toEqual(3);
        });

        it('should have the same distance between time labels as step width of given range', function () {
            getTimeRanges().forEach(rangeTime => {
                const samples = buildChartData([[1, 2, 3]], rangeTime, meta, chartColors);
                const timeLabels = samples.data.map(sample => sample.x);
                const diffInMin = (timeLabels[2].getTime() - timeLabels[1].getTime()) / (1000 * 60);
                expect(diffInMin).toEqual(lookupStepWidthInMinutesOfRange[rangeTime]);
            });
        });
    });

});

describe('Test creation of chart-data data samples', function () {
    const func = createChartDataSamples;
    const numberOfDates = 10;
    // dates with latest first
    const dates: Date[] = createRangeArray(numberOfDates).map(time => new Date((numberOfDates - time) * 60000));

    describe('Test insufficient setter-condition-option given', function () {

        it('should return empty array if no xValues given', function () {
            expect(func([], [])).toEqual([]);
        });

        it('should return array with empty yValues if no yValues given', function () {
            expect(func(dates.slice(0, 3), [])).toEqual([2, 1, 0].map(idx => ({x: dates[idx], yCharts: []})));
        });
    });

    describe('Test simple ChartSample generation', function () {

        it('should generate one ChartSample', function () {
            const expectedChartSample: ChartLineSample[] = [{x: dates[0], yCharts: [42]}];
            expect(func([dates[0]], [[42]])).toEqual(expectedChartSample);
        });
    });

    describe('Test y-value sort', function () {

        it('should use the latest y-value as last element (reverse as given)', function () {
            const values = [[-3, -1, 0, 42, 1]];
            const result = func(dates.slice(0, 5), values);
            expect(result.map(sample => sample.yCharts[0])).toEqual([1, 42, 0, -1, -3]);
        });

        it('should set NaN for y-values if no data available for this timestamp', function () {
            const values = [[-3, -1, 0, 42, 1]];
            const result = func(dates.slice(0, 5 + 1), values);
            expect(result.map(sample => sample.yCharts[0])).toEqual([NaN, 1, 42, 0, -1, -3]);
        });

        it('should handle multiple given y values', function () {
            const values = [[-3, -1, 0, 42, 1], [100, 200, 300, 400, 500], [42.1, 0, 0, 0, 5]];
            const result = func(dates.slice(0, 5), values);
            expect(result.map(sample => sample.yCharts[0])).toEqual([1, 42, 0, -1, -3]);
            expect(result.map(sample => sample.yCharts[1])).toEqual([500, 400, 300, 200, 100]);
            expect(result.map(sample => sample.yCharts[2])).toEqual([5, 0, 0, 0, 42.1]);
        });

        it('should set NaN for y-values if no data available for this timestamp - multiple y-values', function () {
            const values = [[-3, -1, 0, 42], [100, 200], [42.1, 0, 0, 0, 5]];
            const result = func(dates.slice(0, 5), values);
            expect(result.map(sample => sample.yCharts[0])).toEqual([NaN, 42, 0, -1, -3]);
            expect(result.map(sample => sample.yCharts[1])).toEqual([NaN, NaN, NaN, 200, 100]);
            expect(result.map(sample => sample.yCharts[2])).toEqual([5, 0, 0, 0, 42.1]);
        });
    });

});

describe('Test creation of chart-data time labels', function () {
    const func = createTimeLabels;

    function createDate(timestampInMs: number) {
        return new Date(timestampInMs);
    }

    it('should hold latest date at first element', () => {
        const date = new Date(2012, 11, 10, 9, 8, 7, 6);
        const result = func(date.getTime(), 1, 10);
        expect(result[0]).toEqual(date);
    });

    it('should return time labels as array of dates starting with the latest', function () {
        const latestTimestampMs = 10 * 1000;
        const intervalInSec = 1;
        const numberOfLabels = 10;
        const result = func(latestTimestampMs, intervalInSec, numberOfLabels);
        expect(result.length).toEqual(numberOfLabels);
        expect(result[0]).toEqual(createDate(latestTimestampMs));
        expect(result[numberOfLabels - 1]).toEqual(createDate(1000));
    });

    it('should return array of time labels with a distance between every time label equal given interval', function () {
        const latestTimestampMs = 100 * 1000;
        const intervalInSec = 5;
        const numberOfLabels = 5;
        const result = func(latestTimestampMs, intervalInSec, numberOfLabels);
        expect(result.length).toEqual(numberOfLabels);
        expect(result[0]).toEqual(createDate(latestTimestampMs));
        expect(result[1]).toEqual(createDate(latestTimestampMs - intervalInSec * 1000));
        expect(result[numberOfLabels - 1]).toEqual(createDate(latestTimestampMs - intervalInSec * 1000 * (numberOfLabels - 1)));
    });

});
