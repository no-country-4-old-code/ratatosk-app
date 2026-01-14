import {createSampleStepData} from '@app/lib/chart-data/line/simulation/helper/create-sample-step-data';
import {createTimeSteps} from '../../../../../../../../shared-library/src/functions/time/steps';

describe('Test creation of historic step data for chart simulation', function () {

    it('should return array with (generated) samples which are time shifted by given step (5 min)', function () {
        const steps = createTimeSteps(123);
        steps['1D'][0] = 42;
        steps['1D'][1] = 6;
        steps['1D'][2] = 7;
        const result = createSampleStepData(steps, 3, 5);
        expect(result[0]['1D'][0]).toEqual(42);
        expect(result[1]['1D'][0]).toEqual(6);
        expect(result[2]['1D'][0]).toEqual(7);
    });

    it('should return same history data for same "timestamp"', function () {
        const steps = createTimeSteps(123);
        const result1 = createSampleStepData(steps, 120, 5);
        const result2 = createSampleStepData(steps, 10, 60);
        expect(result1[0]).toEqual(result2[0]);
        expect(result1[12]).toEqual(result2[1]);
        expect(result1[24]).toEqual(result2[2]);
        expect(result1[36]).toEqual(result2[3]);
        expect(result1[48]).toEqual(result2[4]);
        expect(result1[60]).toEqual(result2[5]);
        expect(result1[72]).toEqual(result2[6]);
        expect(result1[84]).toEqual(result2[7]);
        expect(result1[96]).toEqual(result2[8]);
        expect(result1[108]).toEqual(result2[9]);
    });

    it('should return init sample always as first element', function () {
        const steps = createTimeSteps(123);
        const result = createSampleStepData(steps, 5, 5);
        expect(result[0]).toEqual(steps);
    });

    it('should return array with only init sample if number of requested samples is 1', function () {
        const steps = createTimeSteps(123);
        const result = createSampleStepData(steps, 1, 5);
        expect(result).toEqual([steps]);
    });

    it('should throw error if number of requested samples is 0', function () {
        const steps = createTimeSteps(123);
        const call = () => createSampleStepData(steps, 0, 5);
        expect(call).toThrowError();
    });

});
