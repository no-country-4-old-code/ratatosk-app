import {extractSparkline, normalize} from '../../../../src/functions/update/coin/sync/sparkline';
import {
    lookupNumberOfSamplesOfRange,
    numberOfSamplesOfSparkline
} from '../../../../../../../shared-library/src/settings/sampling';
import {createRangeArray} from '../../../../../../../shared-library/src/functions/general/array';

describe('Test sparkline tools', function () {

    describe('Test extract sparkline', function () {
        let requestedLength: number;

        beforeEach(function () {
            requestedLength = 4;
        });

        function act(firstValue: number, historicValues: number[], expected: number[]): void {
            const result = extractSparkline(firstValue, historicValues, requestedLength);
            expect(result).toEqual(expected);
        }

        it('should return NaN array of given number of historic values are not sufficient', function () {
            const expectedNaN = [NaN, NaN, NaN, NaN];
            act(1, [], expectedNaN);
            act(1, [2], expectedNaN);
            act(1, [2, 3], expectedNaN);
        });

        it('should return sliced array if number of given historic values are only sufficient for step width 1', function () {
            const expected = [1, 2, 3, 4];
            act(1, [2, 3, 4], expected);
            act(1, [2, 3, 4, 5], expected);
            act(1, [2, 3, 4, 5, 6], expected);
        });

        it('should return downsampled array if number of given historic values allows higher stepwidth', function () {
            act(1, [2, 3, 4, 5, 6, 7], [1, 3, 5, 7]);
            act(1, [2, 3, 4, 5, 6, 7, 8], [1, 3, 5, 7]);
            act(1, [2, 3, 4, 5, 6, 7, 8, 9], [1, 3, 5, 7]);
            act(1, [2, 3, 4, 5, 6, 7, 8, 9, 10], [1, 4, 7, 10]);
            act(1, [2, 3, 4, 5, 6, 7, 8, 9, 10, 11], [1, 4, 7, 10]);
            act(1, [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], [1, 4, 7, 10]);
            act(1, [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13], [1, 5, 9, 13]);
        });

        it('should work with NaNs', function () {
            act(1, [2, NaN, 4, 5, 6, 7], [1, NaN, 5, 7]);
            act(NaN, [2, 3, 4, 5, 6, 7, 8], [NaN, 3, 5, 7]);
        });

        it('should work with uneven requested lengths', function () {
            requestedLength = 3;
            act(1, [2], [NaN, NaN, NaN]);
            act(1, [2, 3], [1, 2, 3]);
            act(1, [2, 3, 4], [1, 2, 3]);
            act(1, [2, 3, 4, 5], [1, 3, 5]);
            act(1, [2, 3, 4, 5, 6], [1, 3, 5]);
            act(1, [2, 3, 4, 5, 6, 7], [1, 4, 7]);
            act(1, [2, 3, 4, 5, 6, 7, 8], [1, 4, 7]);
            act(1, [2, 3, 4, 5, 6, 7, 8, 9], [1, 5, 9]);
            act(1, [2, 3, 4, 5, 6, 7, 8, 9, 10], [1, 5, 9]);
            act(1, [2, 3, 4, 5, 6, 7, 8, 9, 10, 11], [1, 6, 11]);
            act(1, [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], [1, 6, 11]);
        });

        it('should include one of the last values if run with samples of 1D to indicate rising / falling better', function () {
            const numberOfSamplesOf1D = lookupNumberOfSamplesOfRange['1D'];
            requestedLength = numberOfSamplesOfSparkline;
            const samples = createRangeArray(numberOfSamplesOf1D, 0);
            const sparkline = extractSparkline(samples[0], samples.slice(1), requestedLength);
            expect(sparkline.length).toEqual(requestedLength);
            expect(sparkline[0]).toEqual(samples[0]);
            expect(sparkline[requestedLength - 1]).toEqual(samples[samples.length - 2]);
        });

        it(`should throw no error nor return undefined on any sample length between 0 and ${lookupNumberOfSamplesOfRange['1D']}`, function () {
            requestedLength = numberOfSamplesOfSparkline;
            createRangeArray(lookupNumberOfSamplesOfRange['1D']).forEach(seed => {
                const samples = createRangeArray(seed, 0);
                const sparkline = extractSparkline(samples[0], samples.slice(1), requestedLength);
                sparkline.forEach(value => expect(value).not.toBeUndefined(`Error for seed ${seed}`));
            });
        });
    });

    describe('Test normalize', function () {
        const maxValueOf1Byte = 255;

        function act(givenValues: number[], expected: number[], newMaximum = maxValueOf1Byte): void {
            const result = normalize(givenValues, newMaximum);
            expect(result).toEqual(expected);
        }

        it('should handle empty array', function () {
            act([], []);
        });

        it('should map single value to minimum', function () {
            act([-13233.22], [0]);
            act([-0.0002], [0]);
            act([-1], [0]);
            act([0], [0]);
            act([0.0001], [0]);
            act([1], [0]);
            act([12333.456], [0]);
        });

        it('should handle array of equal values like single values', function () {
            act([0, 0], [0, 0]);
            act([1, 1], [0, 0]);
        });

        it('should strech values to range', function () {
            const expected = [0, maxValueOf1Byte];
            act([0, 1], expected);
            act([-1, 0], expected);
            act([0, 1000], expected);
            act([-1000, 0], expected);
        });

        it('should map multiple values to range of 0 and new maximum and round uneven steps', function () {
            const halfWay = Math.round(maxValueOf1Byte / 2);
            const expected = [0, halfWay, maxValueOf1Byte];
            act([0, 1, 2], expected);
            act([-1, 0, 1], expected);
            act([-99.01, -98.01, -97.01], expected);
        });

        it('should not change already normalized values', function () {
            act([0, 255], [0, 255]);
            act([0, 1, 255, 4, 42, 255, 0], [0, 1, 255, 4, 42, 255, 0]);
        });

        it('should round intermediate steps (no uneven numbers)', function () {
            act([0, 1.01, 255, 3.5, 42.49, 255, 0], [0, 1, 255, 4, 42, 255, 0]);
        });

        it('should quantizie', function () {
            act([0, 1, 2, 3, 4, 8, 10, 1020], [0, 0, 1, 1, 1, 2, 3, 255]);
        });

        it('should work with every positive maximum greater 1', function () {
            act([0, 1, 2, 3, 4], [0, 1, 2, 3, 4], 4);
            act([0, 1, 2, 3, 4], [0, 1, 1, 2, 2], 2);
            act([0, 1, 2, 3, 4], [0, 0, 1, 1, 1], 1);
        });
    });
});
