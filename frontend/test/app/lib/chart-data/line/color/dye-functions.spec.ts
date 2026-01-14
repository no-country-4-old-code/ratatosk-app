import {chartColors, dyeFunctions} from '@app/lib/chart-data/line/color/dye-functions';
import {createArray} from '../../../../../../../shared-library/src/functions/general/array';
import {ColorChart} from '@app/lib/chart-data/interfaces';

describe('Test chart-data dye functions', function () {

    const func = dyeFunctions;
    const lastIdx = chartColors.length - 1;

    it('should return empty array if empty array given', function () {
        expect(func([])).toEqual([]);
    });

    it('should not modify / change already set colors', function () {
        expect(func([chartColors[0]])).toEqual([chartColors[0]]);
        expect(func([chartColors[0], chartColors[2]])).toEqual([chartColors[0], chartColors[2]]);
        expect(func(chartColors)).toEqual(chartColors);
    });

    it('should not change order of already set colors', function () {
        const colors = [chartColors[lastIdx], chartColors[0], chartColors[2]];
        expect(func(colors)).toEqual(colors);
    });

    it('should resolve undefined colors with new color starting with first free color', function () {
        expect(func([undefined])).toEqual([chartColors[0]]);
        expect(func([undefined, undefined])).toEqual([chartColors[0], chartColors[1]]);
        expect(func(createArray(chartColors.length, 0).map(x => undefined) as ColorChart[])).toEqual(chartColors);
    });

    it('should not assign a color which is already taken', function () {
        expect(func([undefined, chartColors[0]])).toEqual([chartColors[1], chartColors[0]]);
        expect(func([undefined, chartColors[0], undefined, chartColors[2], undefined])).toEqual(
            [chartColors[1], chartColors[0], chartColors[3], chartColors[2], chartColors[4]]);
    });

    it('should throw error if not enough colors free', function () {
        const arrayUndefined = createArray(chartColors.length + 1, 0).map(x => undefined) as ColorChart[];
        expect(() => func(arrayUndefined)).toThrowError();
        expect(() => func([...chartColors, undefined] as ColorChart[])).toThrowError();
    });
});
