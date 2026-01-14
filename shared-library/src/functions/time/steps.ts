import {FillFunction} from '../../datatypes/utils';
import {TimeRange, TimeSteps} from '../../datatypes/time';
import {getTimeRanges} from './get-time-ranges';
import {createForEach} from '../general/for-each';
import {createArray} from '../general/array';
import {lookupNumberOfSamplesOfRange} from '../../settings/sampling';


export function createEmptyTimeSteps(): TimeSteps {
    return createSteps(() => []);
}

export function createTimeSteps(seed: number): TimeSteps {
    return createSteps((range, idx) => createArray(lookupNumberOfSamplesOfRange[range], seed * (1 + idx)));
}

// private

function createSteps(fillRange: FillFunction<TimeRange, number[]>): TimeSteps {
    const ranges = getTimeRanges();
    return createForEach(ranges, fillRange);
}