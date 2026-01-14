import {TimeRange} from '../../../../../../../shared-library/src/datatypes/time';
import {
    lookupNumberOfSamplesOfRange,
    lookupStepWidthInMinutesOfRange
} from '../../../../../../../shared-library/src/settings/sampling';
import {TimestampValueSample} from '../interfaces';


export function mapGeckoHistory2Samples(geckoSamples: TimestampValueSample[], destRange: TimeRange): number[] {
    const sampleIntervalInMs = lookupStepWidthInMinutesOfRange[destRange] * 60 * 1000;
    const samples: number[] = [];
    let nextTimestamp: number;

    if (geckoSamples.length > 0) {
        nextTimestamp = getTimestamp(geckoSamples[0]);
        geckoSamples.forEach((currentSample, index) => {
            const currentTimestamp = getTimestamp(currentSample);
            while (currentTimestamp >= nextTimestamp) {
                const sample = getNewSample(currentTimestamp, nextTimestamp, currentSample, geckoSamples[index - 1]);
                samples.unshift(sample);
                nextTimestamp += sampleIntervalInMs;
            }
        });
    }

    return samples.slice(0, lookupNumberOfSamplesOfRange[destRange]);
}

// private

function getTimestamp(gecko: TimestampValueSample): number {
    return gecko[0];
}

function getNewSample(currentTimestamp: number, nextTimestamp: number, currentSample: TimestampValueSample, lastSample: TimestampValueSample) {
    let sample: number;
    if (currentTimestamp === nextTimestamp) {
        sample = getValue(currentSample);
    } else {
        sample = getInterpolatedValue(currentSample, lastSample, nextTimestamp);
    }
    return sample;
}

function getValue(gecko: TimestampValueSample): number {
    return gecko[1];
}

function getInterpolatedValue(currentSample: TimestampValueSample, lastSample: TimestampValueSample, nextTimestamp: number): number {
    const diffY = getValue(currentSample) - getValue(lastSample);
    const diffX = getTimestamp(currentSample) - getTimestamp(lastSample);
    const m = diffY / diffX;
    return m * (nextTimestamp - getTimestamp(lastSample)) + getValue(lastSample);
}
