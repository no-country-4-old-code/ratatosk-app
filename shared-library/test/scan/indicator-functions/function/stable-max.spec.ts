import {FunctionFactory} from '../../../../src/scan/indicator-functions/interfaces';
import {ScopeInMin} from '../../../../src/scan/indicator-functions/params/interfaces-params';
import {createArray, createRangeArray} from '../../../../src/functions/general/array';
import {getScopes} from '../../../../src/scan/indicator-functions/params/get-params';
import {createStableMax} from '../../../../src/scan/indicator-functions/functions/stable-max';
import {TimeSteps} from '../../../../src/datatypes/time';
import {createTimeSteps} from '../../../../src/functions/time/steps';


describe('Test functions "stable min"', function () {
    let dut: FunctionFactory;

    beforeEach(function () {
        dut = createStableMax();
    });

    describe('Test params', function () {

        it('should support basic supportedParams with scope', function () {
            const validParams = {factor: 1, scope: 60 as ScopeInMin};
            expect(() => dut.build(validParams)).not.toThrowError();
        });
    });

    describe('Test if stable max function works with all scopes', function () {

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
        let steps: TimeSteps;

        function act(scope: ScopeInMin): number {
            const params = {factor: 1, scope};
            const func = dut.build(params);
            return func(steps);
        }

        beforeEach(function () {
            steps = createTimeSteps(0);
        });

        it('should return the maximal value', function () {
            steps['1D'] = [10, 100, 1000, 9, 10, 100, 1001, 10, 100, 1000, 100, 100, 8];
            const result = act(60);
            expect(result).toEqual(1001);
        });

        it('should not throw error if not enough samples are given (min/max should be ok with that)', function () {
            steps['1D'] = createRangeArray(11);
            expect(() => act(60)).not.toThrowError();
            expect(act(60)).toEqual(10);
        });

        it('should only consider first 12 samples if scope === 60min is given', function () {
            steps['1D'] = createArray(288, 10);
            steps['1D'][12] = 666;
            const result = act(60);
            expect(result).toEqual(10);
        });

        it('should work with NaN', function () {
            steps['1D'] = createRangeArray(13);
            steps['1D'][3] = NaN;
            const result = act(60);
            expect(result).toEqual(NaN);
        });

        it('should detect max value on every scope if it lays within the first scope', function () {
            const maxValue = 100;
            steps['1D'][10] = maxValue;
            getScopes().forEach(scope => {
                const result = act(scope);
                expect(result).toEqual(maxValue);
            });
        });

        it('should detect max value on every greater scope', function () {
            const maxValue1 = 100;
            const maxValue2 = 1000;
            steps['1D'][1] = maxValue1;
            steps['1W'][2] = maxValue2;
            getScopes().forEach(scope => {
                const result = act(scope);
                if (scope <= 1440) {
                    expect(result).toEqual(maxValue1);
                } else {
                    expect(result).toEqual(maxValue2);
                }
            });
        });
    });
});



