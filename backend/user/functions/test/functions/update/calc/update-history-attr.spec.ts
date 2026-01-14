import {updateHistoryOfCoinAttribute} from '../../../../src/functions/update/coin/calc/update-history';
import {disableConsoleLog} from '../../../test-utils/disable-console-log';
import {
    lookupBufferSizeOfRange,
    lookupNumberOfSamplesOfRange
} from '../../../../../../../shared-library/src/settings/sampling';
import {createArray, createRangeArray} from '../../../../../../../shared-library/src/functions/general/array';
import {createEmptyTimeSteps, createTimeSteps} from '../../../../../../../shared-library/src/functions/time/steps';
import {lowestTimeRange} from '../../../../../../../shared-library/src/functions/time/get-time-ranges';


describe('Test updateHistoryOfCoinAttribute(...)', function () {
    const maxNumberOfSamplesIn1D = lookupNumberOfSamplesOfRange[lowestTimeRange];
    const maxNumberOfSamplesIn1W = lookupNumberOfSamplesOfRange['1W'];
    const bufferSize = lookupBufferSizeOfRange['1W'];
    let timeSteps: any, buffer: any;

    function act(timeSeries: number[]) {
        timeSeries.forEach((sample: number) => {
            updateHistoryOfCoinAttribute(sample, timeSteps, buffer);
        });
    }

    beforeEach(() => {
        disableConsoleLog();
        timeSteps = createEmptyTimeSteps();
        buffer = createEmptyTimeSteps();
    });

    describe('Test series', function () {

        function actSeries(overflow: number, expected1D: number[], expected1W: number[]): void {
            const samples = createRangeArray(maxNumberOfSamplesIn1D + overflow);
            act(samples);
            expect(timeSteps['1D']).toEqual(expected1D);
            expect(timeSteps['1W']).toEqual(expected1W);
            expect(timeSteps['1M']).toEqual([]);
        }

        it('should take 12 samples of range "1D" for one sample of range "1W"', function () {
            expect(bufferSize).toEqual(12);
        });

        it('should put samples directly in first series', function () {
            act([0, 1, 2]);
            expect(timeSteps['1D']).toEqual([2, 1, 0]);
        });

        it('should not add new element to second series if buffer not at least half full', function () {
            const overflow = bufferSize / 2 - 1;
            const expected1D = createRangeArray(maxNumberOfSamplesIn1D, overflow).reverse();
            actSeries(overflow, expected1D, []);
        });

        it('should add new element to second series if buffer is half full', function () {
            const overflow = bufferSize / 2;
            const expected1D = createRangeArray(maxNumberOfSamplesIn1D, overflow).reverse();
            actSeries(overflow, expected1D, [2.5]);
        });

        it('should update latest element until its buffer is full', function () {
            const overflow = bufferSize / 2 + 1;
            const expected1D = createRangeArray(maxNumberOfSamplesIn1D, overflow).reverse();
            actSeries(overflow, expected1D, [3]);
        });

        it('should calculate the final value of element when buffer is full', function () {
            const overflow = bufferSize;
            const expected1D = createRangeArray(maxNumberOfSamplesIn1D, overflow).reverse();
            actSeries(overflow, expected1D, [5.5]);
        });

        it('should not update the element after its completion', function () {
            const overflow = bufferSize + 1;
            const expected1D = createRangeArray(maxNumberOfSamplesIn1D, overflow).reverse();
            actSeries(overflow, expected1D, [5.5]);
        });

        it('should not insert new element if buffer not at least half full', function () {
            const overflow = bufferSize + bufferSize / 2 - 1;
            const expected1D = createRangeArray(maxNumberOfSamplesIn1D, overflow).reverse();
            actSeries(overflow, expected1D, [5.5]);
        });

        it('should insert new element on higher range on index 0 if buffer is half full ', function () {
            const overflow = bufferSize + bufferSize / 2;
            const expected1D = createRangeArray(maxNumberOfSamplesIn1D, overflow).reverse();
            actSeries(overflow, expected1D, [14.5, 5.5]);
        });

        it('should not update the element after its completion on higher range', function () {
            const overflow = bufferSize + bufferSize + 1;
            const expected1D = createRangeArray(maxNumberOfSamplesIn1D, overflow).reverse();
            actSeries(overflow, expected1D, [17.5, 5.5]);
        });

        it('should calculate final value of element on higher range if buffer is full', function () {
            const overflow = bufferSize + bufferSize;
            const expected1D = createRangeArray(maxNumberOfSamplesIn1D, overflow).reverse();
            actSeries(overflow, expected1D, [17.5, 5.5]);
        });

        it('should work for higher ranges', function () {
            const bufferSize1M = lookupBufferSizeOfRange['1M'];
            const overflow = bufferSize * (maxNumberOfSamplesIn1W + bufferSize1M / 2);
            const samples = createRangeArray(maxNumberOfSamplesIn1D + overflow);
            act(samples);
            expect(timeSteps['1M']).toEqual([17.5]);
        });
    });

    describe('Test buffer', function () {
        const overflow1W = (maxNumberOfSamplesIn1W + 1) * bufferSize;

        function actBuffer(overflow: number, expected1W: number[], expected1M: number[]): void {
            const samples = createRangeArray(maxNumberOfSamplesIn1D + overflow);
            act(samples);
            expect(buffer['1D']).toEqual([]);
            expect(buffer['1W']).toEqual(expected1W);
            expect(buffer['1M']).toEqual(expected1M);
        }

        it('should not fill buffer if no overflow happens (buffer 1W)', function () {
            actBuffer(0, [], []);
        });

        it('should fill buffer with overflowed values (buffer 1W)', function () {
            actBuffer(1, [0], []);
        });

        it('should put new values on left side of buffer (buffer 1W)', function () {
            actBuffer(2, [1, 0], []);
        });

        it('should not hold overflowed values in first but in second buffer', function () {
            actBuffer(3, [2, 1, 0], []);
        });

        it('should flush overflowed values in second buffer after 12 samples', function () {
            actBuffer(12, [], []);
        });

        it('should fill buffer again after one iteration', function () {
            actBuffer(13, [12], []);
        });

        it('should not fill buffer if no overflow happens (buffer 1M)', function () {
            actBuffer(overflow1W, [], [5.5]);
        });

        it('should fill buffer with overflowed values (buffer 1M)', function () {
            actBuffer(overflow1W + 1, [1740], [5.5]);
        });

        it('should put new values on left side of buffer (buffer 1M)', function () {
            actBuffer(overflow1W + bufferSize, [], [17.5, 5.5]);
        });
    });

    describe('Test calculation for highest range', function () {
        const numberOfSamplesToGenerateOne5YSample = 12 * 12 * 2 * 7 * 2;

        beforeEach(function () {
            timeSteps = createTimeSteps(1);
        });

        it('should start with full history', function () {
            expect(timeSteps['5Y'].length).toEqual(lookupNumberOfSamplesOfRange['5Y']);
            expect(timeSteps['5Y'].slice(0, 3)).toEqual([6, 6, 6]);
        });

        it('should add new value', function () {
            const random = Math.random() * 1000;
            const samples = createArray(numberOfSamplesToGenerateOne5YSample, random);
            act(samples);
            expect(timeSteps['5Y'].length).toEqual(lookupNumberOfSamplesOfRange['5Y']);
            expect(timeSteps['5Y'].slice(0, 3)).toEqual([5, 6, 6]);
        });
    });
});

