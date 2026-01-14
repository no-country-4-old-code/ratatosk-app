import {createBoolSampleArray$, createBoolSamples, mergeBoolSamples} from '@app/lib/chart-data/bool/chart';
import {createDummyChartBoolSamples, createDummyChartLineSamples} from '@test/helper-frontend/dummy-data/chart';
import {ChartBoolSample, ChartLineSample} from '@app/lib/chart-data/interfaces';
import {marbleRun} from '@test/helper-frontend/marble/functions.spec';
import {MarbleLookup} from '@test/helper-frontend/marble/lookup';
import {cold} from 'jasmine-marbles';
import {mapTo} from 'rxjs/operators';
import {CompareOption} from '../../../../../../shared-library/src/scan/condition/interfaces';


describe('Test create bool samples from chart line samples', function () {
    const func = createBoolSamples;
    let samples: ChartLineSample[];

    function act(values: number[][], compareOption: CompareOption): boolean[] {
        samples = createDummyChartLineSamples(values);
        const result = func(samples, compareOption);
        return result.map(sample => sample.y);
    }

    it('should contain compare scan (<) ', () => {
        const compareResult = act([[0, 1, 1], [1, 1, 0]], '<');
        expect(compareResult[0]).toBeTruthy();
        expect(compareResult[compareResult.length - 1]).toBeFalsy();
    });

    it('should apply compare to interpolated value - (expect: false)', () => {
        const compareResult = act([[0, 1], [1, 0]], '<');
        expect(compareResult).toEqual([true, false, false]);
    });

    it('should apply compare to interpolated value - (expect: true)', () => {
        const compareResult = act([[0, 1], [1.1, 0]], '<');
        expect(compareResult).toEqual([true, true, false]);
    });
});

describe('Test create bool samples from merge of multiple bool samples', function () {
    const func = mergeBoolSamples;
    let samplesArray: ChartBoolSample[][];

    it('should return [] if given array is empty', () => {
        samplesArray = [];
        expect(func(samplesArray)).toEqual([]);
    });

    it('should return sample if only one array was given', () => {
        samplesArray = [[true]].map(createDummyChartBoolSamples);
        expect(func(samplesArray)).toEqual(samplesArray[0]);
    });

    it('should combine given bool with logical and', () => {
        samplesArray = [[true, false], [true, true]].map(createDummyChartBoolSamples);
        expect(func(samplesArray).map(sample => sample.y)).toEqual([true, false]);
    });

    it('should log error if sample-series in array have different length', () => {
        const spyErrorLog = spyOn(console, 'error');
        samplesArray = [[true, false], [true]].map(createDummyChartBoolSamples);
        try {
            func(samplesArray);
        } catch (e) {
            expect(spyErrorLog).toHaveBeenCalledTimes(1);
        }
        expect(spyErrorLog).toHaveBeenCalledTimes(1);
    });
});

describe('Test create bool sample array stream', function () {
    const func = createBoolSampleArray$;
    const lookupSamples: MarbleLookup<ChartLineSample[][]> = {
        a: [[[0, 1], [1, 1]], [[0, 0], [0, 1]]].map(createDummyChartLineSamples),
        b: [[[1, 0], [0, 0]], [[1, 1], [1, 0]]].map(createDummyChartLineSamples),
        c: [[[1, 0], [0, 0]]].map(createDummyChartLineSamples)
    };
    const lookupOption: MarbleLookup<CompareOption[]> = {a: ['<', '>'], b: ['>', '<'], c: ['<']};

    it('should update on change of compare option', () => marbleRun(env => {
        const samples$ = cold('a------', lookupSamples);
        const option$ = cold('a-b-b-a', lookupOption);
        const expected$ = cold('a-a---a');
        const result$ = func(samples$, option$).pipe(mapTo('a'));
        env.expectObservable(result$).toBe(expected$.marbles);
    }));

    it('should update when samples are updated (change check to long)', () => marbleRun(env => {
        const samples$ = cold('a-b-b-a', lookupSamples);
        const option$ = cold('a------', lookupOption);
        const expected$ = cold('a-a-a-a');
        const result$ = func(samples$, option$).pipe(mapTo('a'));
        env.expectObservable(result$).toBe(expected$.marbles);
    }));

    it('should not update when number of compare options and samples differ', () => marbleRun(env => {
        const samples$ = cold('a-b-c-----a', lookupSamples);
        const option$ = cold('c-----a-b--', lookupOption);
        const expected$ = cold('----a-----a');
        const result$ = func(samples$, option$).pipe(mapTo('a'));
        env.expectObservable(result$).toBe(expected$.marbles);
    }));

});
