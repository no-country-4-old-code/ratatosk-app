import {ChartBoolSample} from '@app/lib/chart-data/interfaces';

export function mergeBoolSampleArrays(samplesArray: ChartBoolSample[][]): ChartBoolSample[] {
    const dates: Date[] = samplesArray[0].map(sample => sample.x);
    return dates.map((date, idx) => ({
        x: date,
        y: samplesArray.every(samples => samples[idx].y)
    }));
}
