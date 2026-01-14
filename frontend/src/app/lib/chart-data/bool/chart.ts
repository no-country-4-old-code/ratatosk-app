import {ChartBoolSample, ChartLineSample} from '@app/lib/chart-data/interfaces';
import {mapLine2Bool} from '@app/lib/chart-data/bool/map';
import {interpolateChartLineSamples} from '@app/lib/chart-data/bool/interpolate';
import {mergeBoolSampleArrays} from '@app/lib/chart-data/bool/merge';
import {combineLatest, Observable} from 'rxjs';
import {distinctUntilChanged, filter, map} from 'rxjs/operators';
import {areArraysEqual} from '../../../../../../shared-library/src/functions/general/array';
import {CompareOption} from '../../../../../../shared-library/src/scan/condition/interfaces';

export function createBoolSamples(samples: ChartLineSample[], compare: CompareOption): ChartBoolSample[] {
    const interpolated = interpolateChartLineSamples(samples);
    return mapLine2Bool(interpolated, compare);
}

export function mergeBoolSamples(samplesArray: ChartBoolSample[][]): ChartBoolSample[] {
    const ret = [];
    if (samplesArray.length > 0) {
        checkIfLengthEqual(samplesArray);
        return mergeBoolSampleArrays(samplesArray);
    }
    return ret;
}

export function createBoolSampleArray$(sampleArray$: Observable<ChartLineSample[][]>, options$: Observable<CompareOption[]>): Observable<ChartBoolSample[][]> {
    const changedOptions$ = getChangedOptions$(options$);
    return combineLatest(sampleArray$, changedOptions$).pipe(
        filter(([sampleArray, options]) => options.length === sampleArray.length),
        map(([sampleArray, options]) => {
            return sampleArray.map((samples, idx) => createBoolSamples(samples, options[idx]));
        })
    );
}

// private

function checkIfLengthEqual(samplesArray: any[][]): void {
    const lengthOfFirst = samplesArray[0].length;
    const isLengthEqual = samplesArray.every(samples => samples.length === lengthOfFirst);
    if (!isLengthEqual) {
        console.error('Error in merge samples -> length not equal', samplesArray);
    }
}

function getChangedOptions$(options$: Observable<CompareOption[]>): Observable<CompareOption[]> {
    return options$.pipe(
        distinctUntilChanged((oldOptions, newOptions) => areArraysEqual(oldOptions, newOptions))
    );
}

