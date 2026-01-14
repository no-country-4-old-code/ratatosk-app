import {mergeBoolSampleArrays} from '@app/lib/chart-data/bool/merge';
import {createDummyChartBoolSamples} from '@test/helper-frontend/dummy-data/chart';
import {ChartBoolSample} from '@app/lib/chart-data/interfaces';

describe('Test merge of multiple boolean samples', function () {
    const func = mergeBoolSampleArrays;
    const values0 = [0, 1, 0, 1, 0, 1, 0, 1].map(mapNum2Bool);
    const values1 = [0, 0, 1, 1, 0, 0, 1, 1].map(mapNum2Bool);
    const values2 = [0, 0, 0, 0, 1, 1, 1, 1].map(mapNum2Bool);
    const expected = [0, 1, 1, 1, 1, 1, 1, 1].map(mapNum2Bool);

    function mapNum2Bool(n: number): boolean {
        return n === 0;
    }

    it('should combine arrays', () => {
        const sampleArray: ChartBoolSample[][] = [values0, values1, values2].map(createDummyChartBoolSamples);
        const result = mergeBoolSampleArrays(sampleArray);
        const resultBool = result.map(sample => sample.y);
        expect(resultBool).toEqual(expected);
    });

});
