import {createArray, createRangeArray} from '../../../../../../../../shared-library/src/functions/general/array';

export function extractSparkline(firstValue: number, historicValues: number[], length: number): number[] {
    const numberOfSamples = 1 + historicValues.length;
    const stepWidth = Math.floor((numberOfSamples - 1) / (length - 1)); //Math.floor(numberOfSamples / length);
    if (stepWidth === 0) {
        return createArray(length, NaN);
    } else {
        const historicSparkline = createHistoricSparkline(historicValues, stepWidth, length);
        return [firstValue, ...historicSparkline];
    }
}

export function normalize(values: number[], newMaximum: number): number[] {
    const mininmun = Math.min(...values);
    let normalizedValues = values.map(v => v - mininmun);
    const oldMaximum = Math.max(...normalizedValues);
    if (oldMaximum > 0) {
        normalizedValues = normalizedValues.map(v => Math.round(v * newMaximum / oldMaximum));
    }
    return normalizedValues;
}

// private

function createHistoricSparkline(historicValues: number[], stepWidth: number, length: number): number[] {
    return createRangeArray(length - 1, 1).map(stepIdx => {
        const idx = stepIdx * stepWidth - 1;
        return historicValues[idx];
    });
}