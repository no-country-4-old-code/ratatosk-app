import {ChartLineSample} from '@app/lib/chart-data/interfaces';
import {average} from '../../../../../../shared-library/src/scan/indicator-functions/helper/math';

export function interpolateChartLineSamples(samples: ChartLineSample[]): ChartLineSample[] {
    let previous: ChartLineSample;
    return samples.flatMap(sample => {
        let newSamples = [sample];
        if (previous !== undefined) {
            newSamples = [createInterpolated(previous, sample), sample];
        }
        previous = sample;
        return newSamples;
    });

}

// private

function createInterpolated(previous: ChartLineSample, sample: ChartLineSample): ChartLineSample {
    return {
        x: interpolateDate(previous.x, sample.x),
        yCharts: interpolateY(previous, sample)
    };
}

function interpolateDate(date0: Date, date1: Date): Date {
    const millis = average([date0.getTime(), date1.getTime()]);
    return new Date(millis);
}

function interpolateY(previous: ChartLineSample, sample: ChartLineSample): number[] {
    return previous.yCharts.map((value, idx) => average([value, sample.yCharts[idx]]));
}
