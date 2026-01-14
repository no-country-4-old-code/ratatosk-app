import {FunctionFactory} from '../../../../src/scan/indicator-functions/interfaces';
import {createThreshold} from '../../../../src/scan/indicator-functions/functions/threshold';
import {Params} from '../../../../src/scan/indicator-functions/params/interfaces-params';
import {createEmptyTimeSteps, createTimeSteps} from '../../../../src/functions/time/steps';


describe('Test function "threshold"', function () {
    let dut: FunctionFactory;

    beforeEach(function () {
        dut = createThreshold();
    });

    it('should support basic params and threshold', function () {
        const validParams: Params = {factor: 1, threshold: 1};
        expect(() => dut.build(validParams)).not.toThrowError();
    });

    it('should be independent of steps (empty steps)', function () {
        const threshold = Math.random() * 1000;
        const params: Params = {factor: 1, threshold};
        const steps = createEmptyTimeSteps();
        const func = dut.build(params);
        expect(func(steps)).toEqual(threshold);
    });

    it('should be independent of steps (full steps)', function () {
        const threshold = Math.random() * 1000;
        const params: Params = {factor: 1, threshold};
        const steps = createTimeSteps(10);
        const func = dut.build(params);
        expect(func(steps)).toEqual(threshold);
    });

    it('should work with negative threshold', function () {
        const threshold = Math.random() * -1000;
        const params: Params = {factor: 1, threshold};
        const steps = createTimeSteps(10);
        const func = dut.build(params);
        expect(func(steps)).toEqual(threshold);
    });

    it('should apply factor', function () {
        const threshold = Math.random() * 1000;
        const factor = 1.5;
        const params: Params = {factor, threshold};
        const steps = createEmptyTimeSteps();
        const func = dut.build(params);
        expect(func(steps)).toEqual(factor * threshold);
    });
});



