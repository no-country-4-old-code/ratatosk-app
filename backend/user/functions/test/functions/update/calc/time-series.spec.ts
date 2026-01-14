import {proceedInTimeSeries} from '../../../../src/functions/update/coin/calc/time-series';


describe('Test time series calculation', function () {

    describe('Test calculation depending on buffer size', function () {

        const thresholdSeries = 5;
        const newValue = 1;
        const newValue2 = 2;
        const newValue3 = 3;
        let buffer: number[], series: number[];

        beforeEach(function () {
            buffer = [];
            series = [];
        });

        it('should add first newValue if buffer size is 1', function () {
            const thresholdBuffer = 1;
            const ret = proceedInTimeSeries(newValue, buffer, series, thresholdBuffer, thresholdSeries);
            expect(ret.buffer).toEqual([]);
            expect(ret.series).toEqual([newValue]);
        });

        it('should add first newValue if buffer size is 2 because buffer is at least half full', function () {
            const thresholdBuffer = 2;
            const ret = proceedInTimeSeries(newValue, buffer, series, thresholdBuffer, thresholdSeries);
            expect(ret.buffer).toEqual([newValue]);
            expect(ret.series).toEqual([newValue]);
        });

        it('should not add first newValue if buffer size is 3', function () {
            const thresholdBuffer = 3;
            const ret = proceedInTimeSeries(newValue, buffer, series, thresholdBuffer, thresholdSeries);
            expect(ret.buffer).toEqual([newValue]);
            expect(ret.series).toEqual([]);
        });

        it('should add average of second newValue + buffer if buffer size is 3', function () {
            const thresholdBuffer = 3;
            buffer = [newValue];
            const ret = proceedInTimeSeries(newValue2, buffer, series, thresholdBuffer, thresholdSeries);
            expect(ret.buffer).toEqual([newValue2, newValue]);
            expect(ret.series).toEqual([1.5]);
        });

        it('should add average of third newValue + buffer if buffer size is 3', function () {
            const thresholdBuffer = 3;
            buffer = [newValue2, newValue];
            const ret = proceedInTimeSeries(newValue3, buffer, series, thresholdBuffer, thresholdSeries);
            expect(ret.buffer).toEqual([]);
            expect(ret.series).toEqual([2]);
        });

        it('should not add average of second newValue + buffer if buffer size is 5', function () {
            const thresholdBuffer = 5;
            buffer = [newValue];
            const ret = proceedInTimeSeries(newValue2, buffer, series, thresholdBuffer, thresholdSeries);
            expect(ret.buffer).toEqual([newValue2, newValue]);
            expect(ret.series).toEqual([]);
        });

        it('should add average of third newValue + buffer if buffer size is 5', function () {
            const thresholdBuffer = 5;
            buffer = [newValue2, newValue];
            const ret = proceedInTimeSeries(newValue3, buffer, series, thresholdBuffer, thresholdSeries);
            expect(ret.buffer).toEqual([newValue3, newValue2, newValue]);
            expect(ret.series).toEqual([2]);
        });
    });

    describe('Test grow of series', function () {
        const newValue = 1;
        const thresholdBuffer = 1;
        const thresholdSeries = 3;

        it('should insert new coin at the beginning ', function () {
            const series = [2, 3];
            const ret = proceedInTimeSeries(newValue, [], series, thresholdBuffer, thresholdSeries);
            expect(ret.series).toEqual([newValue, 2, 3]);
        });

        it('should pop last coin if threshold of series is reached', function () {
            const series = [2, 3, 4];
            const ret = proceedInTimeSeries(newValue, [], series, thresholdBuffer, thresholdSeries);
            expect(series.length).toEqual(thresholdSeries);
            expect(ret.series).toEqual([newValue, 2, 3]);
        });
    });

    describe('Test grow of buffer', function () {
        const newValue = 1;
        const thresholdBuffer = 3;
        const thresholdSeries = 5;

        it('should flush buffer if threshold length is reached after adding new lastValue', function () {
            const buffer: number[] = [2, 3];
            const ret = proceedInTimeSeries(newValue, buffer, [], thresholdBuffer, thresholdSeries);
            expect(ret.buffer).toEqual([]);
        });
    });

    describe('Test calculation of new values ', function () {
        const newValue = 1;
        const thresholdBuffer = 6;
        const thresholdSeries = 2;

        it('should calculate the average of values in buffer (overwrite dummy element)', function () {
            const buffer: number[] = [2, 3, 4, 5];
            const series: number[] = [42];
            const ret = proceedInTimeSeries(newValue, buffer, series, thresholdBuffer, thresholdSeries);
            expect(ret.buffer).toEqual([1, 2, 3, 4, 5]);
            expect(ret.series).toEqual([3]);
        });

        it('should calculate the average of values in buffer for new element', function () {
            const buffer: number[] = [2, 3];
            const series: number[] = [42];
            const ret = proceedInTimeSeries(newValue, buffer, series, thresholdBuffer, thresholdSeries);
            expect(ret.buffer).toEqual([1, 2, 3]);
            expect(ret.series).toEqual([2, 42]);
        });
    });
});
