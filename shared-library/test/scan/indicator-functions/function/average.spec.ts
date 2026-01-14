import {createAverage} from '../../../../src/scan/indicator-functions/functions/average';
import {FunctionFactory} from '../../../../src/scan/indicator-functions/interfaces';
import {ScopeInMin} from '../../../../src/scan/indicator-functions/params/interfaces-params';
import {createArray, createRangeArray} from '../../../../src/functions/general/array';
import {getScopes} from '../../../../src/scan/indicator-functions/params/get-params';
import {lookupNumberOfSamplesOfRange} from '../../../../src/settings/sampling';
import {TimeSteps} from '../../../../src/datatypes/time';
import {createEmptyTimeSteps, createTimeSteps} from '../../../../src/functions/time/steps';


describe('Test function "average"', function () {
    let dut: FunctionFactory;

    beforeEach(function () {
        dut = createAverage();
    });

    describe('Test params', function () {

        it('should support basic supportedParams with scope', function () {
            const validParams = {factor: 1, scope: 60 as ScopeInMin};
            expect(() => dut.build(validParams)).not.toThrowError();
        });

        it('should throw error if scope is wrong', function () {
            const invalidParams = {factor: 1, scope: 65 as ScopeInMin};
            expect(() => dut.build(invalidParams)).toThrowError();
        });

        it('should throw error if scope is missing', function () {
            const invalidParams = {factor: 1};
            expect(() => dut.build(invalidParams)).toThrowError();
        });
    });

    describe('Test if average function works with all scopes', function () {

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
        const expectedAverage1D = (lookupNumberOfSamplesOfRange['1D'] - 1) / 2;
        const expectedAverage1W = expectedAverage1D / 7 + stepsValue1W * 6 / 7;
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

        it('should throw error if not enough samples are given (condition handle it and return false)', function () {
            steps['1D'] = createRangeArray(3);
            expect(() => act(60)).toThrowError();
        });

        it('should work with NaN', function () {
            steps['1D'] = createRangeArray(13);
            steps['1D'][3] = NaN;
            const result = act(60);
            expect(result).toEqual(NaN);
        });

        function buildTest(scope: ScopeInMin, expectedResult: number) {
            it(`should return ${expectedResult} as average of last ${scope} minutes in test steps`, function () {
                const result = act(scope);
                expect(result).toBeCloseTo(expectedResult, 5);
            });
        }

        buildTest(60, 5.5);
        buildTest(120, 11.5);
        buildTest(1440, expectedAverage1D);
        buildTest(2880, (expectedAverage1D + stepsValue1W) / 2);
        buildTest(4320, expectedAverage1D / 3 + 2 * stepsValue1W / 3);
        buildTest(10080, expectedAverage1W);
        buildTest(20160, (expectedAverage1W + stepsValue1M) / 2);
    });
});



