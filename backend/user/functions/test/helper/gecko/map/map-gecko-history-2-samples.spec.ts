import {TimeRange} from '../../../../../../../shared-library/src/datatypes/time';
import {disableGeckoTimeSleep, spyOnGeckoRangeAndReturnResponse} from '../../../test-utils/mocks/gecko/spy-on-gecko';
import {average} from '../../../../../../../shared-library/src/scan/indicator-functions/helper/math';
import {
    lookupNumberOfSamplesOfRange,
    sampleIntervalInMinutes
} from '../../../../../../../shared-library/src/settings/sampling';
import {TimestampValueSample} from '../../../../src/helper/gecko/interfaces';
import {mapGeckoHistory2Samples} from '../../../../src/helper/gecko/map/map-gecko-history-2-samples';
import {fetchCoinMarketHistory} from '../../../../src/helper/gecko/requests/request-coin-history';
import {getTimeRanges} from '../../../../../../../shared-library/src/functions/time/get-time-ranges';


describe('Test mapping of gecko samples (timestamp, value) to samples', function () {
    const sampleIntervalInMs = sampleIntervalInMinutes * 60 * 1000;
    const startMs = 1000;
    const point1Ms = startMs + sampleIntervalInMs;
    const point2Ms = point1Ms + sampleIntervalInMs;
    let gecko: TimestampValueSample[];

    function act(data: TimestampValueSample[], expected: number[]): void {
        const range: TimeRange = '1D';
        let result = mapGeckoHistory2Samples(data, range);
        result = result.map(s => Math.round(s * 10000) / 10000);
        expect(result).toEqual(expected);
    }

    it('should return empty array if given no data', function () {
        act([], []);
    });

    it('should use first value as first sample', function () {
        act([[startMs, 42]], [42]);
    });

    it('should return latest value first', function () {
        act([[startMs, 42], [point1Ms, 43]], [43, 42]);
    });

    it(`should hold a temporal distance between every sample of ${sampleIntervalInMinutes} minutes for 1D. ` +
        '(if temporal distance is too low -> ignore [exception: interpolation])', function () {
        gecko = [[startMs, 42], [point1Ms - 2000, 123], [point1Ms - 100, 456]];
        act(gecko, [42]);
    });

    it(`should hold a temporal distance between every sample of ${sampleIntervalInMinutes} minutes for 1D. ` +
        '(if temporal distance matches exactly -> take (very unlikely))', function () {
        gecko = [[startMs, 42], [point1Ms, 123], [point2Ms, 456]];
        act(gecko, [456, 123, 42]);
    });

    it(`should hold a temporal distance between every sample of ${sampleIntervalInMinutes} minutes for 1D. ` +
        '(if temporal distance is too big -> interpolate with last value)', function () {
        gecko = [[startMs, 0], [point1Ms + sampleIntervalInMs / 2, 9]];
        act(gecko, [6, 0]);
    });

    it('should interpolate between surrounding values / timestamps (one timestamp missing)', function () {
        gecko = [[startMs, 0], [point2Ms, 10]];
        act(gecko, [10, 5, 0]);
    });

    it('should interpolate between surrounding values / timestamps (between too small and too big)', function () {
        gecko = [[startMs, 0], [startMs + sampleIntervalInMs / 2, 0], [point1Ms + sampleIntervalInMs / 2, 10], [point2Ms, 42]];
        act(gecko, [42, 5, 0]);
    });

    it('should adapt used temporal distance between every sample according to range', function () {
        const offset24HoursMs = 24 * 60 * 60 * 1000;
        gecko = [[startMs, 0], [startMs + offset24HoursMs, 0]];
        const getLength = (range: TimeRange): number => mapGeckoHistory2Samples(gecko, range).length;
        expect(getLength('1D')).toEqual(288);
        expect(getLength('1W')).toEqual(25);
        expect(getLength('1M')).toEqual(5);
        expect(getLength('3M')).toEqual(2);
        expect(getLength('5Y')).toEqual(1);
    });

    it('should handle complex scenarios', function () {
        gecko = [[startMs, 0], [startMs + 10, 666], [startMs + sampleIntervalInMs / 2, 0], [point1Ms + sampleIntervalInMs / 2, 10],
            [point1Ms + sampleIntervalInMs / 2 + 10, 666]];
        act(gecko, [5, 0]);
    });

    describe('Check for all ranges', function () {
        const categories = ['prices', 'market_caps', 'total_volumes'];

        function buildTest(range: TimeRange, category: string): void {
            it(`should map data of market range response for range ${range} to samples`, async function () {
                disableGeckoTimeSleep();
                spyOnGeckoRangeAndReturnResponse(range);
                const response = await fetchCoinMarketHistory('dummy', 0, 0);
                const data = (response as any)[category] as TimestampValueSample[];
                const result = mapGeckoHistory2Samples(data, range);
                const resultAverageDiff = Math.abs(average(result) - average(data.map(d => d[1])));
                expect(result.length).toEqual(lookupNumberOfSamplesOfRange[range]);
                expect(resultAverageDiff).toBeLessThan(0.2 * average(result)); // check average to see if value ~ the same (could differ)
            });
        }

        categories.forEach(
            category => getTimeRanges().forEach(
                range => buildTest(range, category)));
    });
});


