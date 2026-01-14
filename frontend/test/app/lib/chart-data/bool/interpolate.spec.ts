import {createDummyChartLineSamples} from '@test/helper-frontend/dummy-data/chart';
import {interpolateChartLineSamples} from '@app/lib/chart-data/bool/interpolate';
import {ChartLineSample} from '@app/lib/chart-data/interfaces';

describe('Test chart line sample interpolation', function () {
    const func = interpolateChartLineSamples;
    const dateStepMs = 1000 * 1000;
    const values = [[50, 100, 80], [500, 550, 550]];
    let samples: ChartLineSample[];

    beforeEach(function () {
        samples = createDummyChartLineSamples(values, dateStepMs);
    });

    it('should change length from n to 2*n-1 ', () => {
        expect(samples.length).toEqual(3);
        expect(func(samples).length).toEqual(5);
    });

    it('should interpolate x', () => {
        const stepsMsOrigin = samples.map(sample => sample.x.getTime());
        const stepsMsInter = func(samples).map(sample => sample.x.getTime());
        expect(stepsMsOrigin).toEqual([0, dateStepMs, 2 * dateStepMs]);
        expect(stepsMsInter).toEqual([0, 0.5 * dateStepMs, dateStepMs, 1.5 * dateStepMs, 2 * dateStepMs]);
    });

    it('should interpolate y (first value)', () => {
        const y = samples.map(sample => sample.yCharts[0]);
        const yInter = func(samples).map(sample => sample.yCharts[0]);
        expect(y).toEqual(values[0]);
        expect(yInter).toEqual([50, 75, 100, 90, 80]);
    });

    it('should interpolate y (second value)', () => {
        const y = samples.map(sample => sample.yCharts[1]);
        const yInter = func(samples).map(sample => sample.yCharts[1]);
        expect(y).toEqual(values[1]);
        expect(yInter).toEqual([500, 525, 550, 550, 550]);
    });
});
