import {average} from '../../../../../../../../shared-library/src/scan/indicator-functions/helper/math';

export interface TimeSeries {
    buffer: number[];
    series: number[];
    overflowedValue?: number;
}

export function proceedInTimeSeries(sample: number, buffer: number[], series: number[], thresholdBuffer: number, thresholdSeries: number): TimeSeries {
    const timeSeries = createTimeSeriesValue(sample, buffer, series);
    const value = average(timeSeries.buffer);
    handleSeries(timeSeries, value, buffer.length, thresholdBuffer, thresholdSeries);
    handleBuffer(timeSeries, thresholdBuffer);
    return timeSeries;
}


// -------- private


function createTimeSeriesValue(sample: number, buffer: number[], series: number[]): TimeSeries {
    return {
        buffer: [sample, ...buffer],
        series: series
    };
}

function handleSeries(timeSeries: TimeSeries, value: number, oldBufferLength: number, thresholdBuffer: number, thresholdSeries: number): void {
    const thresholdNewElement = Math.floor((thresholdBuffer - 1) / 2);

    if (oldBufferLength === thresholdNewElement) {
        addNewElement(timeSeries, value, thresholdSeries);
    } else if (oldBufferLength > thresholdNewElement) {
        updateLatestElement(timeSeries, value);
    } else {
        // no change in series to minimize error. A sample is at least always half full.
    }
}

function handleBuffer(timeSeries: TimeSeries, thresholdBuffer: number): void {
    if (timeSeries.buffer.length >= thresholdBuffer) {
        timeSeries.buffer = [];
    }
}

function addNewElement(timeSeries: TimeSeries, value: number, thresholdSeries: number): void {
    timeSeries.series.splice(0, 0, value);
    if (timeSeries.series.length > thresholdSeries) {
        timeSeries.overflowedValue = timeSeries.series.pop();
    }
}

function updateLatestElement(timeSeries: TimeSeries, value: number): void {
    timeSeries.series[0] = value;
}
