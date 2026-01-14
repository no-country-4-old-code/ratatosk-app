import {FunctionFactory} from '../../../../src/scan/indicator-functions/interfaces';
import {createValue} from '../../../../src/scan/indicator-functions/functions/value';
import {TimeSteps} from '../../../../src/datatypes/time';
import {lowestTimeRange} from '../../../../src/functions/time/get-time-ranges';
import {createEmptyTimeSteps, createTimeSteps} from '../../../../src/functions/time/steps';


describe('Test function "value"', function () {
    let steps: TimeSteps;
    let dut: FunctionFactory;

    beforeEach(function () {
        steps = createEmptyTimeSteps();
        dut = createValue();
    });

    it('should support basic supportedParams', function () {
        const validParams = {factor: 1};
        expect(() => dut.build(validParams)).not.toThrowError();
    });

    it('should throw error if param is wrong', function () {
        const invalidParams = {factor: -666};
        expect(() => dut.build(invalidParams)).toThrowError();
    });

    it('should throw error if not enough samples there', function () {
        const params = {factor: 1};
        const func = dut.build(params);
        expect(() => func(steps)).toThrowError();
    });

    it('should return latest indicator-functions of requested attribute of given history data as input', function () {
        const params = {factor: 1};
        steps['1D'] = [2, 3, 4];
        const func = dut.build(params);
        expect(func(steps)).toEqual(2);
    });

    it('should apply factor', function () {
        const params = {factor: 2};
        steps['1D'] = [-3, -4];
        const func = dut.build(params);
        expect(func(steps)).toEqual(-6);
    });

    it('should simply return first value', () => {
        const params = {factor: 1};
        const func = dut.build(params);
        steps = createTimeSteps(0);
        const randomValue = Math.random() * 123;
        steps[lowestTimeRange][0] = randomValue;
        expect(func(steps)).toEqual(randomValue);
    });
});



