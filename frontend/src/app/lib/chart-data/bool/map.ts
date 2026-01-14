import {ChartBoolSample, ChartLineSample} from '@app/lib/chart-data/interfaces';
import {lookupCompareFunction} from '../../../../../../shared-library/src/scan/condition/lookup-compare';
import {CompareOption} from '../../../../../../shared-library/src/scan/condition/interfaces';


export function mapLine2Bool(samples: ChartLineSample[], compareOption: CompareOption): ChartBoolSample[] {
    const compare = lookupCompareFunction[compareOption];
    return samples.map(sample => ({
        x: sample.x,
        y: compare(sample.yCharts[0], sample.yCharts[1])
    }));
}
