import {TimeRange} from '../../../../../../../shared-library/src/datatypes/time';
import {ChartData, ChartLineSample, ColorChart} from '@app/lib/chart-data/interfaces';
import {lookupStepWidthInMinutesOfRange} from '../../../../../../../shared-library/src/settings/sampling';
import {createRangeArray} from '../../../../../../../shared-library/src/functions/general/array';
import {MetaData} from '../../../../../../../shared-library/src/datatypes/meta';


export function buildChartData(values: number[][], range: TimeRange, meta: MetaData, colors: ColorChart[]): ChartData {
    let chartData: ChartData = {unit: meta.unit, colors: [], data: []};

    if (values.length > 0) {
        const numberOfLabels = getMaxNumberOfLabels(values);
        const stepWidthInSec = 60 * lookupStepWidthInMinutesOfRange[range];
        const dates = createTimeLabels(meta.timestampMs, stepWidthInSec, numberOfLabels);
        chartData = {
            unit: meta.unit,
            colors: colors.slice(0, values.length),
            data: createChartDataSamples(dates, values)
        };
    }
    return chartData;
}

// ---------- private -------

export function createChartDataSamples(xValues: Date[], yValues: number[][]): ChartLineSample[] {
    const samples = xValues.map((date, idx): ChartLineSample => ({x: date, yCharts: extractValues(yValues, idx)}));
    return samples.reverse();
}

function extractValues(yValues: number[][], idx: number): number[] {
    return yValues.map(values => {
        let extractedValue = NaN;
        if (values.length > idx) {
            extractedValue = values[idx];
        }
        return extractedValue;
    });
}

export function createTimeLabels(latestTimestampInMs: number, intervalInSec: number, numberOfLabels: number): Date[] {
    const intervalInMs = intervalInSec * 1000;
    return createRangeArray(numberOfLabels).map(i => new Date(latestTimestampInMs - intervalInMs * i));
}

function getMaxNumberOfLabels(xValues: number[][]): number {
    return Math.max(...xValues.map(values => values.length));
}

