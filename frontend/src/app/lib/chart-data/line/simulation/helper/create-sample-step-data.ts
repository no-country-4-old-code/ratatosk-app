import {createRangeArray} from '../../../../../../../../shared-library/src/functions/general/array';
import {removeOldValuesFromSteps} from '@app/lib/chart-data/line/simulation/helper/remove-old-values';
import {fixMalformedSteps} from '@app/lib/chart-data/line/simulation/helper/fix-malformed-steps';
import {TimeSteps} from '../../../../../../../../shared-library/src/datatypes/time';

export function createSampleStepData(stepDataStart: TimeSteps, numberOfSamples: number, stepWidthInMin: number): TimeSteps[] {
    const samples = [{...stepDataStart}];
    const n = numberOfSamples - 1;

    if (numberOfSamples === 0) {
        throw new Error();
    }

    createRangeArray(n, 1).forEach(idx => {
        const data = removeOldValuesFromSteps(stepDataStart, stepWidthInMin * idx);
        samples[idx] = fixMalformedSteps(data);
    });

    return samples;
}

