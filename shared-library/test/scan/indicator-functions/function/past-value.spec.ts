import {FunctionFactory} from '../../../../src/scan/indicator-functions/interfaces';
import {ScopeInMin} from '../../../../src/scan/indicator-functions/params/interfaces-params';
import {createArray, createRangeArray} from '../../../../src/functions/general/array';
import {getScopes} from '../../../../src/scan/indicator-functions/params/get-params';
import {createPastValue} from '../../../../src/scan/indicator-functions/functions/past-value';
import {lookupNumberOfSamplesOfRange, lookupStepWidthInMinutesOfRange} from '../../../../src/settings/sampling';
import {TimeSteps} from '../../../../src/datatypes/time';
import {createEmptyTimeSteps, createTimeSteps} from '../../../../src/functions/time/steps';


describe('Test function "average"', function () {
    let dut: FunctionFactory;

    beforeEach(function () {
        dut = createPastValue();
    });

    describe('Test params', function () {

        it('should support basic supportedParams with scope', function () {
            const validParams = {factor: 1, scope: 60 as ScopeInMin};
            expect(() => dut.build(validParams)).not.toThrowError();
        });
    });

    describe('Test if past value function works with all scopes', function () {

        it('should throw no error if called with valid scope filled steps', () => {
            const steps = createTimeSteps(1); // this should be an example steps for backend to also check out of range error
            getScopes().forEach(scope => {
                const params = {factor: 1, scope};
                const func = dut.build(params);
                func(steps);
                expect(() => func(steps)).not.toThrowError();
            });
        });
    });

    describe('Test calculation', function () {
        const stepsValue1W = 10;
        const stepsValue1M = 100;
        let steps: TimeSteps;

        function act(scope: ScopeInMin): number {
            const params = {factor: 1, scope};
            const func = dut.build(params);
            return func(steps);
        }

        beforeEach(function () {
            steps = createEmptyTimeSteps();
            steps['1D'] = createRangeArray(lookupNumberOfSamplesOfRange['1D']);
            steps['1W'] = createArray(lookupNumberOfSamplesOfRange['1W'], stepsValue1W);
            steps['1M'] = createArray(lookupNumberOfSamplesOfRange['1M'], stepsValue1M);
        });

        it('should return value of given scope (scope: 60)', function () {
            const value = Math.random() * 1000;
            const scope: ScopeInMin = 60;
            const idx = 11; //scope / lookupStepWidthInMinutesOfRange['1D'];
            steps['1D'][idx] = value;
            const result = act(scope);
            expect(result).toEqual(value);
        });

        it('should return value of given scope (scope: 120)', function () {
            const value = Math.random() * 1000;
            const scope: ScopeInMin = 120;
            const idx = scope / lookupStepWidthInMinutesOfRange['1D'] - 1;
            steps['1D'][idx] = value;
            const result = act(scope);
            expect(result).toEqual(value);
        });

        it('should return value of given scope (scope: 2880)', function () {
            const value = Math.random() * 1000;
            const scope: ScopeInMin = 2880;
            const idx = 23;
            steps['1W'][idx] = value;
            const result = act(scope);
            expect(result).toEqual(value);
        });

        it('should throw error if not enough samples are given (condition handle it and return false)', function () {
            steps['1D'] = createRangeArray(3);
            expect(() => act(60)).toThrowError();
        });

        it('should work with NaN', function () {
            steps['1D'] = createRangeArray(13);
            steps['1D'][11] = NaN;
            const result = act(60);
            expect(result).toEqual(NaN);
        });
    });
});



