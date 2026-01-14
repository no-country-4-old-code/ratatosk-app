import {
    lookupFrontendRange2TimeRange,
    lookupSamplesOfFrontendRange
} from '@app/lib/coin/range-frontend/lookup-frontend-range';
import {TimeRangeFrontend} from '@app/lib/coin/interfaces';
import {TimeRange} from '../../../../../../shared-library/src/datatypes/time';

export function getTimeRangesFrontend(): TimeRangeFrontend[] {
    return Object.keys(lookupFrontendRange2TimeRange) as TimeRangeFrontend[];
}

export function wasExtendedRangeGiven(range: TimeRange, givenRange: TimeRangeFrontend): boolean {
    return range !== givenRange;
}

export function rmvStartOfArrayToTimeRangeFrontendLength<T>(array: T[], timeRangeFrontend: TimeRangeFrontend): T[] {
    // used to get samples of frontend range from data with latest value last (chartData)
    let startIdx = array.length - lookupSamplesOfFrontendRange[timeRangeFrontend];
    startIdx = Math.max(startIdx, 0);
    return array.slice(startIdx);
}

export function rmvEndOfArrayToTimeRangeFrontendLength<T>(array: T[], timeRangeFrontend: TimeRangeFrontend): T[] {
    // used to get samples of frontend range from data with latest value first (selector-condition-option data)
    const endIdx = lookupSamplesOfFrontendRange[timeRangeFrontend];
    return array.slice(0, endIdx);
}
