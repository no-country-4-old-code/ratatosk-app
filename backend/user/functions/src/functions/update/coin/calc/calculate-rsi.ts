import {average} from '../../../../../../../../shared-library/src/scan/indicator-functions/helper/math';
import {TimeSteps} from '../../../../../../../../shared-library/src/datatypes/time';
import {getTimeRanges} from '../../../../../../../../shared-library/src/functions/time/get-time-ranges';
import {lookupStepWidthInMinutesOfRange} from '../../../../../../../../shared-library/src/settings/sampling';
import {createRangeArray} from '../../../../../../../../shared-library/src/functions/general/array';

export function calculateRsi(currentPrice: number, prices: TimeSteps): number {
    const numberOfDays = 14;
    let rsi = 50; // 50 is the neutral value for the rsi
    try {
        const deltaOfDays = splitInDeltaOfDays(currentPrice, prices, numberOfDays);
        const relativeStrength = calculateRelativeStrength(deltaOfDays);
        rsi = map2Index(relativeStrength);
    } catch (e) {
        console.error('Error occur during calculation of RSI ', e.message);
    }
    return rsi;
}

// private

export function splitInDeltaOfDays(current: number, prices: TimeSteps, numberOfDays: number): number[] {
    // maximal numberOfDays depends on resolution (as long as 1 Day is represented by more then 1 sample, it is ok)
    const firstDelta = calcDeltaOfFirstDay([current, ...prices['1D']]);
    const other = calcDeltaOfDaysAfterFirstDay(prices, numberOfDays - 1);
    return [firstDelta, ...other];
}

export function calculateRelativeStrength(deltaOfDays: number[]): number {
    const gains = getDaysWithGain(deltaOfDays);
    const losses = getDaysWithAbsoluteLoss(deltaOfDays);
    let strength: number;
    if (gains.length === 0 && losses.length === 0) {
        strength = 1; // a relative strength of 1 means draw - both are even.
    } else if (gains.length === 0) {
        strength = 0;
    } else if (losses.length === 0) {
        strength = Infinity;
    } else {
        strength = average(gains) / average(losses);
    }
    return strength;
}

function map2Index(relativeStrength: number): number {
    return 100 - (100 / (1 + relativeStrength));
}

function getDaysWithGain(deltaOfDays: number[]): number[] {
    return deltaOfDays.filter(delta => delta > 0);
}

function getDaysWithAbsoluteLoss(deltaOfDays: number[]): number[] {
    return deltaOfDays.filter(delta => delta < 0).map(delta => Math.abs(delta));
}

function calcDeltaOfFirstDay(samples: number[]): number {
    const first1H = average(samples.slice(0, 12));
    const last1H = average(samples.slice(samples.length - 12));
    return first1H - last1H;
}

function calcDeltaOfDaysAfterFirstDay(prices: TimeSteps, numberOfDays: number): number[] {
    const minutesPerDay = 60 * 24;
    let daysLeft = numberOfDays;
    return getTimeRanges('1W').flatMap(range => {
            let result: number[] = [];
            if (daysLeft > 0) {
                const samples = prices[range];
                const samplesPerDay = minutesPerDay / lookupStepWidthInMinutesOfRange[range];
                const deltaDaysForRange = calcDeltaOfDaysWithinRange(samples, samplesPerDay);
                result = deltaDaysForRange.slice(0, daysLeft);
                daysLeft -= result.length;
            }
            return result;
        }
    );
}

function calcDeltaOfDaysWithinRange(samples: number[], samplesPerDay: number): number[] {
    const numberOfDaysInRange = Math.floor(samples.length / samplesPerDay);
    return createRangeArray(numberOfDaysInRange).map(idx => {
        const offset = idx * samplesPerDay;
        const first = samples[offset];
        const last = samples[offset + samplesPerDay - 1];
        return first - last;
    });
}