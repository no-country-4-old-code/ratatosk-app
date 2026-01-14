import {
    lookupSampledDurationInMinutesOfRange,
    lookupStepWidthInMinutesOfRange
} from '../../../../../../../../shared-library/src/settings/sampling';
import {getTimeRanges} from '../../../../../../../../shared-library/src/functions/time/get-time-ranges';
import {TimeSteps} from '../../../../../../../../shared-library/src/datatypes/time';

export function removeOldValuesFromSteps(steps: TimeSteps, timePastInMin: number): TimeSteps {
    const newSteps = {...steps};
    getTimeRanges().forEach(range => {
        if (timePastInMin >= lookupSampledDurationInMinutesOfRange[range]) {
            newSteps[range] = [];
            timePastInMin -= lookupSampledDurationInMinutesOfRange[range];
        } else if (timePastInMin > 0) {
            const numberOfOldSamples = Math.floor(timePastInMin / lookupStepWidthInMinutesOfRange[range]);
            newSteps[range] = newSteps[range].slice(numberOfOldSamples);
            timePastInMin = 0;
        }
    });
    return newSteps;
}

