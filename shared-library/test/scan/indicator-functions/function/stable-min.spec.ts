import {FunctionFactory} from '../../../../src/scan/indicator-functions/interfaces';
import {ScopeInMin} from '../../../../src/scan/indicator-functions/params/interfaces-params';
import {createArray, createRangeArray} from '../../../../src/functions/general/array';
import {getScopes} from '../../../../src/scan/indicator-functions/params/get-params';
import {createStableMin} from '../../../../src/scan/indicator-functions/functions/stable-min';
import {TimeSteps} from '../../../../src/datatypes/time';
import {createEmptyTimeSteps, createTimeSteps} from '../../../../src/functions/time/steps';


describe('Test functions "stable min"', function () {
    let dut: FunctionFactory;

    beforeEach(function () {
        dut = createStableMin();
    });

    describe('Test params', function () {

        it('should support basic supportedParams with scope', function () {
            const validParams = {factor: 1, scope: 60 as ScopeInMin};
            expect(() => dut.build(validParams)).not.toThrowError();
        });
    });

    describe('Test if stable min function works with all scopes', function () {

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

        it('should return the minimal value', function () {
            steps = createEmptyTimeSteps();
            steps['1D'] = [10, 100, 1000, 9.99, 10, 100, 1000, 12, 123, 42, 43, 44, 45];
            const result = act(60);
            expect(result).toEqual(9.99);
        });

        it('should not throw error if not enough samples are given (min/max should be ok with that)', function () {
            steps['1D'] = createRangeArray(3);
            expect(() => act(60)).not.toThrowError();
            expect(act(60)).toEqual(0);
        });

        it('should only consider first 12 samples if scope === 60min is given', function () {
            steps['1D'] = createArray(288, 10);
            steps['1D'][12] = -666;
            const result = act(60);
            expect(result).toEqual(10);
        });

        it('should work with NaN', function () {
            steps['1D'] = createRangeArray(13);
            steps['1D'][3] = NaN;
            const result = act(60);
            expect(result).toEqual(NaN);
        });

        it('should detect min value on every scope if it lays within the first scope', function () {
            const minValue = -1;
            steps['1D'][10] = minValue;
            getScopes().forEach(scope => {
                const result = act(scope);
                expect(result).toEqual(minValue);
            });
        });

        it('should detect min value on every greater scope', function () {
            const minValue1 = -1;
            const minValue2 = -2;
            steps['1D'][1] = minValue1;
            steps['1W'][2] = minValue2;
            getScopes().forEach(scope => {
                const result = act(scope);
                if (scope <= 1440) {
                    expect(result).toEqual(minValue1);
                } else {
                    expect(result).toEqual(minValue2);
                }
            });
        });
    });
});



