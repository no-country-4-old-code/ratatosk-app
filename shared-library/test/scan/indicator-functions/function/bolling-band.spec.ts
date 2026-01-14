import {FunctionFactory} from '../../../../src/scan/indicator-functions/interfaces';
import {Params, ScopeInMin} from '../../../../src/scan/indicator-functions/params/interfaces-params';
import {createArray, createRangeArray} from '../../../../src/functions/general/array';
import {getScopes} from '../../../../src/scan/indicator-functions/params/get-params';
import {createDeviation} from '../../../../src/scan/indicator-functions/functions/deviation';
import {average, std} from '../../../../src/scan/indicator-functions/helper/math';
import {createAverage} from '../../../../src/scan/indicator-functions/functions/average';
import {lookupNumberOfSamplesOfRange, lookupStepWidthInMinutesOfRange} from '../../../../src/settings/sampling';
import {TimeSteps} from '../../../../src/datatypes/time';
import {createEmptyTimeSteps, createTimeSteps} from '../../../../src/functions/time/steps';


describe('Test function deviation', function () {
    let dut: FunctionFactory;

    beforeEach(function () {
        dut = createDeviation();
    });

    describe('Test calculation', function () {
        const stepsValue1W = 10;
        const stepsValue1M = 100;
        let steps: TimeSteps;

        function act(scope: ScopeInMin, weight: number): number {
            const params: Params = {factor: 1, scope, weight};
            const func = dut.build(params);
            return func(steps);
        }

        beforeEach(function () {
            steps = createEmptyTimeSteps();
            steps['1D'] = createRangeArray(lookupNumberOfSamplesOfRange['1D']);
            steps['1W'] = createArray(lookupNumberOfSamplesOfRange['1W'], stepsValue1W);
            steps['1M'] = createArray(lookupNumberOfSamplesOfRange['1M'], stepsValue1M);
        });

        describe('Test for scope of 60 minutes', function () {
            const scope: ScopeInMin = 60;
            let samples: number[];

            beforeEach(function () {
                samples = steps['1D'].slice(0, 12);
            });

            it('should return average + weighted standard deviation (with weight: 0)', function () {
                const result = act(scope, 0);
                const expected = average(samples);
                expect(result).toBeCloseTo(expected, 5);
            });

            it('should return average + weighted standard deviation (with weight: +1)', function () {
                const weight = 1;
                const result = act(scope, weight);
                const expected = average(samples) + weight * std(samples);
                expect(result).toBeCloseTo(expected, 5);
            });

            it('should return average + weighted standard deviation (with weight: +1.5)', function () {
                const weight = 1.5;
                const result = act(scope, weight);
                const expected = average(samples) + weight * std(samples);
                expect(result).toBeCloseTo(expected, 5);
            });

            it('should return average + weighted standard deviation (with weight: -1)', function () {
                const weight = -1;
                const result = act(scope, weight);
                const expected = average(samples) + weight * std(samples);
                expect(result).toBeCloseTo(expected, 5);
            });

            it('should return value independent of weight if standard deviation is 0', function () {
                steps['1D'] = createArray(288, 42.24);
                const resultStd0 = act(60, 0);
                const resultStd1 = act(60, 1);
                const resultStdM1 = act(60, -1);
                expect(resultStd0).toEqual(resultStd1);
                expect(resultStd0).toEqual(resultStdM1);
            });
        });

        describe('Multiple scopes', function () {

            function actAverage(scope: ScopeInMin): number {
                const params: Params = {factor: 1, scope};
                const func = createAverage().build(params);
                return func(steps);
            }

            it('should return same result as average function if weight is zero', function () {
                const scopes: ScopeInMin[] = [60, 120, 180, 720, 1440, 2880, 4320, 8640, 10080, 20160];
                scopes.forEach(scope => {
                    const result = act(scope, 0);
                    const expected = actAverage(scope);
                    expect(result).toEqual(expected);
                });
            });

            it('should return average + weight * std of given scope (scope <= 1440)', function () {
                const scopes: ScopeInMin[] = [60, 120, 180, 720, 1440];
                const weights = [-1, 0, 1, 1.5];
                scopes.forEach(scope => {
                    weights.forEach(weight => {
                        const samples = steps['1D'].slice(0, scope / lookupStepWidthInMinutesOfRange['1D']);
                        const result = act(scope, weight);
                        const expected = average(samples) + weight * std(samples);
                        expect(result).toEqual(expected);
                    });
                });
            });
        });

        describe('Special cases', function () {
            it('should throw error if not enough samples are given (condition handle it and return false)', function () {
                steps['1D'] = createRangeArray(3);
                expect(() => act(60, 1)).toThrowError();
            });

            it('should work with NaN', function () {
                steps['1D'] = createRangeArray(13);
                steps['1D'][3] = NaN;
                const result = act(60, 1);
                expect(result).toEqual(NaN);
            });
        });
    });

    describe('Test params', function () {

        it('should support basic supportedParams with scope and weight', function () {
            const validParams: Params = {factor: 1, scope: 60, weight: 1};
            expect(() => dut.build(validParams)).not.toThrowError();
        });
    });

    describe('Test if deviation function works with all scopes', function () {

        it('should throw no error if called with valid scope filled steps', () => {
            const steps = createTimeSteps(1); // this should be an example history for backend to also check out of range error
            getScopes().forEach(scope => {
                const params: Params = {factor: 1, scope, weight: 1};
                const func = dut.build(params);
                func(steps);
                expect(() => func(steps)).not.toThrowError();
            });
        });
    });
});



