import {lookupSampledDurationInMinutesOfRange} from '../../src/settings/sampling';
import {getTimeRanges, lowestTimeRange} from '../../src/functions/time/get-time-ranges';

describe('Test create coin reference function which return keys of calc step', function () {

    it('should always return lowest range as first element', function () {
        expect(getTimeRanges()[0]).toEqual(lowestTimeRange);
    });

    it('should return ranges in increasing order', function () {
        let lastRange = lowestTimeRange;
        const ranges = getTimeRanges().slice(1);
        ranges.forEach(range => {
            expect(lookupSampledDurationInMinutesOfRange[range]).toBeGreaterThan(lookupSampledDurationInMinutesOfRange[lastRange]);
            lastRange = range;
        });
    });
});
