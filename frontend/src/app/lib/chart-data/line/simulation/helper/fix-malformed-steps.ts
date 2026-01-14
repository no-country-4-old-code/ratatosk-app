import {LookupTimeRange2Number, TimeRange, TimeSteps} from '../../../../../../../../shared-library/src/datatypes/time';
import {createArray} from '../../../../../../../../shared-library/src/functions/general/array';
import {
    lookupNumberOfSamplesOfRange,
    lookupStepWidthInMinutesOfRange
} from '../../../../../../../../shared-library/src/settings/sampling';
import {createForEach} from '../../../../../../../../shared-library/src/functions/general/for-each';
import {getTimeRanges} from '../../../../../../../../shared-library/src/functions/time/get-time-ranges';
import {createEmptyTimeSteps} from '../../../../../../../../shared-library/src/functions/time/steps';


export function fixMalformedSteps(malformed: TimeSteps): TimeSteps {
    const steps: TimeSteps = createEmptyTimeSteps();
    const buffer = {...malformed};
    const bufferValueHealth = {...bufferValueHealthMax};

    getTimeRanges().forEach(range => {
        steps[range] = createSamplesForRange(range, buffer, bufferValueHealth);
    });
    return steps;
}

// private

const bufferValueHealthMax: LookupTimeRange2Number = createBufferValueHealthMax();


function createSamplesForRange(range: TimeRange, buffer: TimeSteps, bufferValueHealth: LookupTimeRange2Number) {
    let samples = buffer[range];

    getTimeRanges(range).slice(1).forEach(higherRange => {
        const numberOfSamplesNeeded = lookupNumberOfSamplesOfRange[range] - samples.length;
        if (numberOfSamplesNeeded > 0) {
            const fake = generateSamplesFromHigherRange(range, higherRange, numberOfSamplesNeeded, buffer, bufferValueHealth);
            samples = samples.concat(fake);
        }
    });
    return samples;
}

function generateSamplesFromHigherRange(range: TimeRange, higherRange: TimeRange, numberOfSamplesNeeded: number, buffer: TimeSteps, lifePoints: LookupTimeRange2Number): number[] {
    const samples = generateSamples(range, higherRange, numberOfSamplesNeeded, buffer, lifePoints);
    if (samples.length > 0) {
        updateBuffer(range, higherRange, samples.length, buffer, lifePoints);
    }
    return samples;
}

function generateSamples(range: TimeRange, higherRange: TimeRange, numberOfSamplesNeeded: number, buffer: TimeSteps, lifePoints: LookupTimeRange2Number): number[] {
    const growFactor2Lower = getScaleFactor(higherRange, range);
    const growFactor2LowerReduced = Math.ceil(growFactor2Lower * lifePoints[higherRange] / bufferValueHealthMax[higherRange]);
    const numberOfSamplesNeededFromHigherRange = Math.ceil(numberOfSamplesNeeded / growFactor2Lower);

    const firstSample = buffer[higherRange].slice(0, 1).flatMap(sample => createArray(growFactor2LowerReduced, sample));
    const other = buffer[higherRange].slice(1, numberOfSamplesNeededFromHigherRange + 1).flatMap(sample => createArray(growFactor2Lower, sample));
    return [...firstSample, ...other].slice(0, numberOfSamplesNeeded);
}

function updateBuffer(range: TimeRange, higherRange: TimeRange, numberOfAddedSamples: number, buffer: TimeSteps, firstValueHealth: LookupTimeRange2Number) {
    const numberOfSampleUsedInHighRange = convertToRange(numberOfAddedSamples, range, higherRange);
    const numberOfSamplesToRemoveFromHighRange = Math.floor(numberOfSampleUsedInHighRange);

    if (numberOfSamplesToRemoveFromHighRange > 0) {
        buffer[higherRange] = buffer[higherRange].slice(numberOfSamplesToRemoveFromHighRange);
        firstValueHealth[higherRange] = bufferValueHealthMax[higherRange];
    }
    updateHealthOfFirstBufferValue(range, higherRange, numberOfAddedSamples, numberOfSamplesToRemoveFromHighRange, firstValueHealth, buffer);
}

function updateHealthOfFirstBufferValue(range: TimeRange, higherRange: TimeRange, numberOfAddedSamples: number,
                                        numberOfSamplesToRemoveFromHighRange: number, firstValueHealth: LookupTimeRange2Number, buffer: TimeSteps) {
    // "Health" is needed to ensure that a samples of higher ranges wears even if it is used to create samples for a time < of the step size of its range.
    const healthDiff = convertToHealth(numberOfAddedSamples, range) - convertToHealth(numberOfSamplesToRemoveFromHighRange, higherRange);
    firstValueHealth[higherRange] -= healthDiff;

    if (firstValueHealth[higherRange] <= 0) {
        buffer[higherRange] = buffer[higherRange].slice(1);
        firstValueHealth[higherRange] += bufferValueHealthMax[higherRange];
    }
}

function createBufferValueHealthMax() {
    const ranges = getTimeRanges();
    return createForEach(ranges, (range) => convertToRange(1, range, '1D'));
}

function convertToHealth(n: number, srcRange: TimeRange): number {
    return convertToRange(n, srcRange, '1D');
}

function convertToRange(numberOfSamplesSrc: number, rangeSrc: TimeRange, rangeDest: TimeRange) {
    const scaleFactor = lookupStepWidthInMinutesOfRange[rangeSrc] / lookupStepWidthInMinutesOfRange[rangeDest];
    return scaleFactor * numberOfSamplesSrc;
}

function getScaleFactor(rangeSrc, rangeDest) {
    return lookupStepWidthInMinutesOfRange[rangeSrc] / lookupStepWidthInMinutesOfRange[rangeDest];
}
