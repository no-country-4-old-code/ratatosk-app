import {
    calculateRelativeStrength,
    calculateRsi,
    splitInDeltaOfDays
} from '../../../../src/functions/update/coin/calc/calculate-rsi';
import {createEmptyTimeSteps, createTimeSteps} from '../../../../../../../shared-library/src/functions/time/steps';
import {createArray, createRangeArray} from '../../../../../../../shared-library/src/functions/general/array';
import {lookupNumberOfSamplesOfRange} from '../../../../../../../shared-library/src/settings/sampling';

describe('Test calculation of RSI', function () {

    describe('Test calculation of relative strength index', function () {

        function act(current: number, prices1D: number[] = [], prices1W: number[] = [], prices1M: number[] = []): number {
            const timestamps = createEmptyTimeSteps();
            timestamps['1D'] = prices1D;
            timestamps['1W'] = prices1W;
            timestamps['1M'] = prices1M;
            const result = calculateRsi(current, timestamps);
            expect(result).toBeGreaterThanOrEqual(0);
            expect(result).toBeLessThanOrEqual(100);
            return result;
        }

        it('should return 50 if no history is given (50 is the neutral value for the rsi)', function () {
            const result = act(42);
            expect(result).toEqual(50);
        });

        it('should be robust and return 50 if invalid values are given', function () {
            const result = act(undefined as any as number);
            expect(result).toEqual(50);
        });

        it('should work even if history is not complete', function () {
            const samples1D = createArray(lookupNumberOfSamplesOfRange['1D'], 12);
            samples1D.reverse();
            const result = act(123, samples1D);
            expect(result).toEqual(100);
        });

        it('should return 100 if only increasing', function () {
            const samples1D = createRangeArray(lookupNumberOfSamplesOfRange['1D'], -10);
            samples1D.reverse();
            const result = act(123, samples1D);
            expect(result).toEqual(100);
        });

        it('should return 0 if only decreasing', function () {
            const samples1D = createRangeArray(lookupNumberOfSamplesOfRange['1D'], -10);
            const result = act(-123, samples1D);
            expect(result).toEqual(0);
        });

        it('should handle half full history', function () {
            const samples1D = createArray(lookupNumberOfSamplesOfRange['1D'], 12);
            const samples1W = createRangeArray(lookupNumberOfSamplesOfRange['1W'], 12);
            const samples1M = createRangeArray(lookupNumberOfSamplesOfRange['1W'], 0);
            samples1W.reverse();
            const result = act(0, samples1D, samples1W, samples1M);
            expect(result).toBeGreaterThan(70);
        });

        it('should handle full history', function () {
            [-101001, -11, 0, 2, 10000].forEach(seed => {
                const timestamps = createTimeSteps(42);
                const result = calculateRsi(seed, timestamps);
                expect(result).toBeGreaterThanOrEqual(0);
                expect(result).toBeLessThanOrEqual(100);
            });
        });
    });

    describe('Test calculation of relative strength', function () {

        function act(deltaOfDays: number[], expected: number): void {
            const result = calculateRelativeStrength(deltaOfDays);
            expect(result).toEqual(expected);
        }

        it('should return 1 if no sample is given (1 is the neutral value for the RS)', function () {
            act([], 1);
        });

        it('should return 1 if only zeros are given', function () {
            act([0], 1);
            act([0, 0], 1);
        });

        it('should return Infinity if no negative values are given', function () {
            act([1], Infinity);
            act([1, 0], Infinity);
            act([1, 2, 3], Infinity);
        });

        it('should return 0 if no positive values are given', function () {
            act([-1], 0);
            act([-1, 0], 0);
            act([-1, -2, -3], 0);
        });

        it('should return 1 if relation of positive values and negative values are even', function () {
            act([1, 0, 2, -1, -2], 1);
            act([0, 0, 1, -1], 1);
            act([0, 0, 100, -150, -50], 1);
        });

        it('should return 2 if positive values are doubled strong as absolute negative values', function () {
            act([8, -4], 2);
            act([8, -4, 0], 2);
        });

        it('should return 0.5 if negative values are doubled strong as positive values', function () {
            act([4, -8], 0.5);
            act([4, -8, 0], 0.5);
        });
    });

    describe('Test splitting of prices to delta days', function () {

        function act(current: number, prices1D: number[] = [], prices1W: number[] = [], prices1M: number[] = []): number[] {
            const timestamps = createEmptyTimeSteps();
            timestamps['1D'] = prices1D;
            timestamps['1W'] = prices1W;
            timestamps['1M'] = prices1M;
            return splitInDeltaOfDays(current, timestamps, 14);
        }

        it('should return array with only 0 if given empty timestamps', function () {
            const result = act(42);
            expect(result).toEqual([0]);
        });

        it('should return array with only 0 if not enough samples in first range', function () {
            const samples1D = createArray(1, 12);
            const result = act(42, samples1D);
            expect(result).toEqual([0]);
        });

        it('should use the average over an hour of the first and last value when calculating delta for 1D range', function () {
            const samples1D = createArray(lookupNumberOfSamplesOfRange['1D'], 12);
            const result = act(-24, samples1D);
            expect(result).toEqual([-3]);
        });

        it('should create seven elements if samples up to 1W are full.', function () {
            const samples1D = createArray(lookupNumberOfSamplesOfRange['1D'], 12);
            const samples1W = createArray(lookupNumberOfSamplesOfRange['1W'], 12);
            const result = act(24, samples1D, samples1W);
            expect(result).toEqual([1, 0, 0, 0, 0, 0, 0]);
        });

        it('should use the first and last value if calculating for ranges over 1D.', function () {
            const samples1D = createArray(lookupNumberOfSamplesOfRange['1D'], 12);
            const samples1W = createRangeArray(lookupNumberOfSamplesOfRange['1W'], -42);
            const result = act(24, samples1D, samples1W);
            expect(result).toEqual([1, -23, -23, -23, -23, -23, -23]);
        });

        it('should calculate delta of each day independt.', function () {
            const samples1D = createArray(lookupNumberOfSamplesOfRange['1D'], 12);
            const samples1W = createRangeArray(lookupNumberOfSamplesOfRange['1W'], -42);
            samples1W[24] = 100000;
            const result = act(24, samples1D, samples1W);
            expect(result).toEqual([1, -23, 99995, -23, -23, -23, -23]);
        });

        it('should create fourtheen elements if samples up to 1M are full.', function () {
            const samples1D = createArray(lookupNumberOfSamplesOfRange['1D'], 12);
            const samples1W = createArray(lookupNumberOfSamplesOfRange['1W'], 12);
            const samples1M = createRangeArray(lookupNumberOfSamplesOfRange['1W'], 0);
            const result = act(24, samples1D, samples1W, samples1M);
            expect(result).toEqual([1, 0, 0, 0, 0, 0, 0, ...createArray(7, -3)]);
        });

        it('should create fourtheen elements even if history complete full.', function () {
            const maxNumberOfDays = 14;
            const timestamps = createTimeSteps(42);
            const result = splitInDeltaOfDays(0, timestamps, 14);
            expect(result.length).toEqual(maxNumberOfDays);
        });

    });

});