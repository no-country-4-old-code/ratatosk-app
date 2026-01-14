import {ScopeInMin} from '../params/interfaces-params';
import {lookupSampledDurationInMinutesOfRange} from '../../../settings/sampling';
import {getTimeRanges} from '../../../functions/time/get-time-ranges';
import {TimeRange} from '../../../datatypes/time';


type FunctionApplyCallback = (range: TimeRange, timeUsedInRange: number, timeAll: number, timeAllLeft: number) => void;

export function iterateOverRanges(scope: ScopeInMin, callback: FunctionApplyCallback): void {
    const timeAll = scope;
    let timeLeft: number = scope;

    getTimeRanges().forEach(range => {
        if (timeLeft > 0) {
            let timeInRange = timeLeft;
            if (timeInRange > lookupSampledDurationInMinutesOfRange[range]) {
                timeInRange = lookupSampledDurationInMinutesOfRange[range];
            }
            timeLeft -= timeInRange;
            callback(range, timeInRange, timeAll, timeLeft);
        }
    });
}
