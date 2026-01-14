import {createRangeArray} from '../../../../../shared-library/src/functions/general/array';
import {
    getTimeRangesFrontend,
    rmvEndOfArrayToTimeRangeFrontendLength,
    rmvStartOfArrayToTimeRangeFrontendLength
} from '@app/lib/coin/range-frontend/range-frontend';
import {
    lookupFrontendRange2TimeRange,
    lookupSamplesOfFrontendRange
} from '@app/lib/coin/range-frontend/lookup-frontend-range';
import {TimeRangeFrontend} from '@app/lib/coin/interfaces';
import {lookupNumberOfSamplesOfRange} from '../../../../../shared-library/src/settings/sampling';
import {getTimeRanges} from '../../../../../shared-library/src/functions/time/get-time-ranges';


describe('Test time range frontend', function () {

    it('should never need more samples for a frontend range as for its related standard range', function () {
        getTimeRangesFrontend().forEach(range => {
            const higherRange = lookupFrontendRange2TimeRange[range];
            expect(lookupSamplesOfFrontendRange[range]).toBeLessThanOrEqual(lookupSamplesOfFrontendRange[higherRange]);
        });
    });

    describe('Test lookup frontend time range 2 selector-condition-option time range', function () {
        it('should return same value if a selector-condition-option time range was given', function () {
            getTimeRanges().forEach(range => {
                expect(lookupFrontendRange2TimeRange[range]).toEqual(range);
            });
        });
    });

    describe('Test lookup of number of samples for frontend time range', function () {
        it('should return correct number of samples for selector-condition-option range', function () {
            getTimeRanges().forEach(range => {
                expect(lookupSamplesOfFrontendRange[range]).toEqual(lookupNumberOfSamplesOfRange[range]);
            });
        });
    });

    describe('Test helper', function () {
        const timeRangeFrontend: TimeRangeFrontend = '1H';
        const numberOfSamplesRemained = lookupSamplesOfFrontendRange[timeRangeFrontend];
        const numberOfSamples = 100;
        const numberOfSamplesRemoved = numberOfSamples - numberOfSamplesRemained;
        const values = createRangeArray(numberOfSamples);

        it(`should remove first ${numberOfSamplesRemoved} samples of array`, () => {
            const result = rmvStartOfArrayToTimeRangeFrontendLength(values, timeRangeFrontend);
            expect(result[0]).toEqual(numberOfSamples - numberOfSamplesRemained);
            expect(result[result.length - 1]).toEqual(numberOfSamples - 1);
            expect(result.length).toEqual(numberOfSamplesRemained);
        });

        it(`should remove last ${numberOfSamplesRemoved} samples of array`, () => {
            const result = rmvEndOfArrayToTimeRangeFrontendLength(values, timeRangeFrontend);
            expect(result).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
            expect(result.length).toEqual(numberOfSamplesRemained);
        });

    });

});
