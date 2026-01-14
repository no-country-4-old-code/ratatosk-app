import {TimeRange} from '../../src/datatypes/time';
import {sum} from '../../src/scan/indicator-functions/helper/math';
import {lookupSampledDurationInMinutesOfRange} from '../../src/settings/sampling';

describe('Test if time ranges could be combined to cover greater time ranges', function () {
    const minutesOfDay = 60 * 24;
    const minutesOfWeek = 7 * minutesOfDay;
    const minutesOfYear = 52 * minutesOfWeek + minutesOfDay;

    function buildTest(ranges: TimeRange[], expectedMinutes: number): void {
        it(`should cover ${expectedMinutes} minutes by combing these ranges: ${ranges}`, function () {
            const minutes = ranges.map(range => lookupSampledDurationInMinutesOfRange[range]);
            const covered = sum(minutes);
            expect(covered).toEqual(expectedMinutes);
        });
    }

    buildTest(['1D'], minutesOfDay);
    buildTest(['1D', '1W'], minutesOfWeek);
    buildTest(['1D', '1W', '1M'], 31 * minutesOfDay);
    buildTest(['1D', '1W', '1M', '3M'], 13 * minutesOfWeek);
    buildTest(['1D', '1W', '1M', '3M', '1Y'], minutesOfYear - minutesOfDay); // correction to have 52 weeks for one year
    buildTest(['1D', '1W', '1M', '3M', '1Y', '5Y'], 5 * minutesOfYear);
});
