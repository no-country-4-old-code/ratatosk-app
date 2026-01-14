import {mapLine2Bool} from '@app/lib/chart-data/bool/map';
import {createDummyChartLineSamples} from '@test/helper-frontend/dummy-data/chart';
import {CompareOption} from '../../../../../../shared-library/src/scan/condition/interfaces';

describe('Test map chart line sample to boolean chart samples', function () {
    const func = mapLine2Bool;
    const values = [
        [0, 1, 1, 0, 0, 0, 0, 0],
        [1, 1, 1, 1, 0, 1, 1, 0]
    ];
    const samples = createDummyChartLineSamples(values);

    it('test dummy samples', () => {
        expect(samples.length).toEqual(8);
        expect(samples[0].yCharts).toEqual([0, 1]);
        expect(samples[7].yCharts).toEqual([0, 0]);
    });

    it('should not modify x value', () => {
        const result = func(samples, '<').map(sample => sample.x);
        expect(result).toEqual(samples.map(sample => sample.x));
    });

    describe('Test compare', function () {

        function act(option: CompareOption, expected: boolean[]): void {
            const result = func(samples, option).map(sample => sample.y);
            expect(result).toEqual(expected);
        }

        it('should contain compare result (for <)', () => {
            act('<', [true, false, false, true, false, true, true, false]);
        });

        it('should contain compare result (for >=)', () => {
            act('>=', [false, true, true, false, true, false, false, true]);
        });
    });

});
