import {Currency} from '../datatypes/currency';
import {LookupTimeRange2Number, TimeRange} from '../datatypes/time';
import {createForEach} from '../functions/general/for-each';
import {getTimeRanges} from '../functions/time/get-time-ranges';

export const sampleIntervalInMinutes = 5;
export const sampleDbCurrency: Currency = 'usd';
export const numberOfSamplesOfSparkline = 27; // resolution of < 1H and sparkline includes first element and ~ last element.
export const maxSampleIntervalInMinutes = sampleIntervalInMinutes * 1.5; // could deviate

export const lookupCompleteDurationInMinutesOfRange: LookupTimeRange2Number = {
    '1D': 60 * 24,
    '1W': 60 * 24 * 7,
    '1M': 60 * 24 * 31,
    '3M': 60 * 24 * 91,
    '1Y': 60 * 24 * 364, // correction to have 52 weeks for one year
    '5Y': 60 * 24 * 365 * 5,
};

export const lookupStepWidthInMinutesOfRange: LookupTimeRange2Number = {
    '1D': sampleIntervalInMinutes,
    '1W': 60,
    '1M': 60 * 6,
    '3M': 60 * 24,
    '1Y': 60 * 24 * 7,
    '5Y': 60 * 24 * 7 * 2, // Max calc depth
};

export const lookupSampledDurationInMinutesOfRange: LookupTimeRange2Number = getLookupDurationInMinutesOfRange();
export const lookupNumberOfSamplesOfRange: LookupTimeRange2Number = getLookupNumberOfSamplesOfRange();
export const lookupBufferSizeOfRange: LookupTimeRange2Number = getLookupNumberOfLowerValuesNeededForHigherValue();

// ---------- private

function getLookupDurationInMinutesOfRange(): LookupTimeRange2Number {
    const ranges = getTimeRanges();
    let coveredTimeInMin = 0;
    return createForEach(ranges, (range) => {
        const time = lookupCompleteDurationInMinutesOfRange[range] - coveredTimeInMin;
        coveredTimeInMin += time;
        return time;
    });
}

function getLookupNumberOfSamplesOfRange(): LookupTimeRange2Number {
    const ranges = getTimeRanges();
    return createForEach(ranges, (range) => {
        return Math.round(lookupSampledDurationInMinutesOfRange[range] / lookupStepWidthInMinutesOfRange[range]);
    });
}

// noinspection FunctionNamingConventionJS
export function getLookupNumberOfLowerValuesNeededForHigherValue(): LookupTimeRange2Number {
    const ranges = getTimeRanges();
    const obj: any = {};
    ranges.forEach((currentRange, idx) => {
        const previousRange = getPreviousRange(idx, ranges);
        obj[currentRange] = getBufferWidth(currentRange, previousRange);
    });
    return obj as LookupTimeRange2Number;
}

function getPreviousRange(index: number, ranges: TimeRange[]): TimeRange {
    let range = ranges[0];
    if (index > 0) {
        range = ranges[index - 1];
    }
    return range;
}

function getBufferWidth(current: TimeRange, previous: TimeRange): number {
    return Math.round(lookupStepWidthInMinutesOfRange[current] / lookupStepWidthInMinutesOfRange[previous]);
}
