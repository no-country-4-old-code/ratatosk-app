import {fixMalformedSteps} from '@app/lib/chart-data/line/simulation/helper/fix-malformed-steps';
import {createArray} from '../../../../../../../../shared-library/src/functions/general/array';
import {lookupNumberOfSamplesOfRange} from '../../../../../../../../shared-library/src/settings/sampling';
import {createEmptyTimeSteps, createTimeSteps} from '../../../../../../../../shared-library/src/functions/time/steps';
import {TimeSteps} from '../../../../../../../../shared-library/src/datatypes/time';

describe('Test if malformed step data could be converted to correct one properly', function () {
    // malformed === first time values are not set, need to "shift" from higher range to start
    const scaleFactor1Wto1D = 12;
    let steps: TimeSteps;

    beforeEach(function () {
        steps = createEmptyTimeSteps();
    });

    describe('Generate samples for lower range from samples of higher range', function () {

        it('should do nothing if only lowest range has values (seems not to be malformed)', function () {
            steps['1D'] = [3, 2, 1, 42];
            const result = fixMalformedSteps(steps);
            expect(result).toEqual(steps);
        });

        it('should shift values from 1W to 1D and split them according to step relation', function () {
            steps['1W'] = [3];
            const result = fixMalformedSteps(steps);
            const expected1D = createArray(scaleFactor1Wto1D, 3);
            expect(result['1D']).toEqual(expected1D);
            expect(result['1W']).toEqual([]);
        });

        it('should append shifted values form higher range behind already existing samples of this range', function () {
            steps['1D'] = [2, 1, 42];
            steps['1W'] = [3];
            const result = fixMalformedSteps(steps);
            const expected1D = [2, 1, 42, ...createArray(scaleFactor1Wto1D, 3)];
            expect(result['1D']).toEqual(expected1D);
            expect(result['1W']).toEqual([]);
        });

        it('should shift multiple values from 1W to 1D and split them according to step relation', function () {
            steps['1W'] = [3, 4, 5];
            const result = fixMalformedSteps(steps);
            const expected1D = [...createArray(scaleFactor1Wto1D, 3), ...createArray(scaleFactor1Wto1D, 4), ...createArray(scaleFactor1Wto1D, 5)];
            expect(result['1D']).toEqual(expected1D);
            expect(result['1W']).toEqual([]);
        });

        it('should shift over multiple range', function () {
            steps['1M'] = [4, 4, 4, 4]; // step width 12 H
            const result = fixMalformedSteps(steps);
            const expected1D = createArray(lookupNumberOfSamplesOfRange['1D'], 4);
            expect(result['1D']).toEqual(expected1D);
            expect(result['1W']).toEqual([]);
            expect(result['1M']).toEqual([]);
            expect(result['3M']).toEqual([]);
            expect(result['1Y']).toEqual([]);
        });

        it('should not increase nor decrease the covered time (start with 1Y)', function () {
            steps['1Y'] = [5]; // step width 1 week
            const result = fixMalformedSteps(steps);
            const expected1D = createArray(lookupNumberOfSamplesOfRange['1D'], 5);
            const expected1W = createArray(lookupNumberOfSamplesOfRange['1W'], 5);
            expect(result['1D']).toEqual(expected1D);
            expect(result['1W']).toEqual(expected1W);
            expect(result['1M']).toEqual([]);
            expect(result['3M']).toEqual([]);
            expect(result['1Y']).toEqual([]);
        });

        it('should not increase nor decrease the covered time (start with 5Y)', function () {
            steps['5Y'] = [6]; // step width 2 weeks
            const result = fixMalformedSteps(steps);
            const expected1D = createArray(lookupNumberOfSamplesOfRange['1D'], 6); // 1 day
            const expected1W = createArray(lookupNumberOfSamplesOfRange['1W'], 6); // 6 days
            const expected1M = createArray(28, 6); // 1 week
            expect(result['1D']).toEqual(expected1D);
            expect(result['1W']).toEqual(expected1W);
            expect(result['1M']).toEqual(expected1M);
            expect(result['3M']).toEqual([]);
            expect(result['1Y']).toEqual([]);
        });

        it('should not increase nor decrease the covered time (start with 1Y and 5Y)', function () {
            steps['1Y'] = [5]; // step width 1 week
            steps['5Y'] = [6]; // step width 2 weeks
            const result = fixMalformedSteps(steps);
            const expected1D = createArray(lookupNumberOfSamplesOfRange['1D'], 5); // 1 day
            const expected1W = [...createArray(lookupNumberOfSamplesOfRange['1W'], 5)]; // 6 days
            const expected1M = createArray(56, 6); // 1 week
            expect(result['1D']).toEqual(expected1D);
            expect(result['1W']).toEqual(expected1W);
            expect(result['1M']).toEqual(expected1M);
            expect(result['3M']).toEqual([]);
            expect(result['1Y']).toEqual([]);
        });
    });

    describe('Use cases', function () {

        it('should not change greater range if lower range took less than "scale factor" samples', function () {
            const mark1 = Math.random() * -666;
            const mark2 = Math.random() * 666;
            steps = createTimeSteps(mark2);
            steps['1D'] = steps['1D'].slice(scaleFactor1Wto1D - 1);
            steps['1W'][0] = mark1;
            steps['1W'][1] = mark2;
            const result = fixMalformedSteps(steps);
            expect(result['1D'].length).toEqual(lookupNumberOfSamplesOfRange['1D']);
            expect(result['1D'].slice(-(scaleFactor1Wto1D - 1))).toEqual(createArray(scaleFactor1Wto1D - 1, mark1));
            expect(result['1W']).toEqual(steps['1W']);
            expect(mark1).not.toEqual(mark2);
        });


        it('should change greater range if lower range took at least "scale factor" samples', function () {
            const mark1 = Math.random() * -666;
            const mark2 = Math.random() * 666;
            steps = createTimeSteps(mark2);
            steps['1D'] = steps['1D'].slice(scaleFactor1Wto1D);
            steps['1W'][0] = mark1;
            steps['1W'][1] = mark2;
            const result = fixMalformedSteps(steps);
            expect(result['1D'].length).toEqual(lookupNumberOfSamplesOfRange['1D']);
            expect(result['1D'].slice(-(scaleFactor1Wto1D))).toEqual(createArray(scaleFactor1Wto1D, mark1));
            expect(result['1W'][0]).toEqual(mark2);
            expect(mark1).not.toEqual(mark2);
        });
    });

    describe('Special cases', function () {

        it('should do nothing if given steps are empty', function () {
            const result = fixMalformedSteps(steps);
            expect(result).toEqual(steps);
        });

        it('should do nothing if given steps are not malformed', function () {
            steps = createTimeSteps(0);
            const result = fixMalformedSteps(steps);
            expect(result).toEqual(steps);
        });
    });
});
