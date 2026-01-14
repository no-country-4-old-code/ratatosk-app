import {TimeRange} from '../../datatypes/time';

export const lowestTimeRange = getTimeRanges()[0];

export function getTimeRanges(minRange?: TimeRange): TimeRange[] {
    // Output has to be sorted (increasing in duration)
    const dummy: { [range in TimeRange]: number } = {'1D': NaN, '1W': NaN, '1M': NaN, '3M': NaN, '1Y': NaN, '5Y': NaN};
    let timeRanges = Object.keys(dummy) as TimeRange[];
    if (minRange !== undefined) {
        const idx = timeRanges.indexOf(minRange);
        timeRanges = timeRanges.slice(idx);
    }
    return timeRanges;
}