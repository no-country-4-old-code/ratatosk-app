import {removeOldValuesFromSteps} from '@app/lib/chart-data/line/simulation/helper/remove-old-values';
import {
    lookupSampledDurationInMinutesOfRange,
    lookupStepWidthInMinutesOfRange
} from '../../../../../../../../shared-library/src/settings/sampling';
import {lowestTimeRange} from '../../../../../../../../shared-library/src/functions/time/get-time-ranges';
import {createEmptyTimeSteps, createTimeSteps} from '../../../../../../../../shared-library/src/functions/time/steps';
import {TimeSteps} from '../../../../../../../../shared-library/src/datatypes/time';

describe('Test if all "expired" data inside step could be removed properly', function () {
    let steps: TimeSteps;

    beforeEach(function () {
        steps = createTimeSteps(0);
    });

    it('should do nothing if steps already empty', function () {
        steps = createEmptyTimeSteps();
        const result = removeOldValuesFromSteps(steps, 42);
        expect(result).toEqual(steps);
    });

    it('should remove no values if given "expired" time is zero', function () {
        const result = removeOldValuesFromSteps(steps, 0);
        expect(result).toEqual(steps);
    });

    it('should remove first two values if expired time is two step width', function () {
        const timeExpired = 2 * lookupStepWidthInMinutesOfRange[lowestTimeRange];
        steps[lowestTimeRange] = [1, 2, 3, ...steps[lowestTimeRange], 666, 424];
        const result = removeOldValuesFromSteps(steps, timeExpired);
        expect(result[lowestTimeRange].length).toEqual(steps[lowestTimeRange].length - 2);
        expect(result[lowestTimeRange].slice(0, 2)).toEqual(steps[lowestTimeRange].slice(2, 4));
        expect(result[lowestTimeRange].slice(-2)).toEqual(steps[lowestTimeRange].slice(-2));
    });

    it('should remove values of range entirely if expired time is complete duration of range', function () {
        const timeExpired = lookupSampledDurationInMinutesOfRange['1D'];
        const result = removeOldValuesFromSteps(steps, timeExpired);
        expect(steps['1D'].length).toBeGreaterThan(0);
        expect(result['1D']).toEqual([]);
        expect(result['1W']).toEqual(steps['1W']);
    });

    it('should remove values of ranges entirely if expired time covers duration of multiple ranges', function () {
        const timeExpired = lookupSampledDurationInMinutesOfRange['1D'] + lookupSampledDurationInMinutesOfRange['1W'];
        const result = removeOldValuesFromSteps(steps, timeExpired);
        expect(result['1D'].length).toEqual(0);
        expect(result['1W']).toEqual([]);
        expect(result['1M']).toEqual(steps['1M']);
        expect(result['3M']).toEqual(steps['3M']);
    });

    it('should not remove any values from later stages (no overlap between stages)', function () {
        const timeExpired = lookupSampledDurationInMinutesOfRange['1D'] + lookupSampledDurationInMinutesOfRange['1W'] + lookupSampledDurationInMinutesOfRange['1M'];
        const result = removeOldValuesFromSteps(steps, timeExpired);
        expect(result['1D'].length).toEqual(0);
        expect(result['1W']).toEqual([]);
        expect(result['1M']).toEqual([]);
        expect(result['3M']).toEqual(steps['3M']);
    });

    it('should remove everything if much expired time covers everything', function () {
        const timeExpired = 2 * lookupSampledDurationInMinutesOfRange['5Y'];
        const ref = createEmptyTimeSteps();
        const result = removeOldValuesFromSteps(steps, timeExpired);
        expect(result).toEqual(ref);
    });
});
