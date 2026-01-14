import {buildIndicatorFunction} from '../../../src/scan/indicator-functions/build';
import {createFunctionBlueprint} from '../../../src/functions/test-utils/dummy-data/condition';
import {ScopeInMin} from '../../../src/scan/indicator-functions/params/interfaces-params';
import {createTimeSteps} from '../../../src/functions/time/steps';
import {FunctionOption} from '../../../src/scan/indicator-functions/interfaces';

describe('Test build condition functions', function () {
    const steps = createTimeSteps(10);

    function getValidBlueprint() {
        const params = {factor: 1};
        return createFunctionBlueprint(1, 'value', params);
    }

    it('should create function correctly if blueprint is valid 1', function () {
        const valid = getValidBlueprint();
        const func = buildIndicatorFunction(valid);
        expect(func(steps)).toEqual(10);
    });

    it('should create function correctly if blueprint is valid 2', function () {
        const params = {factor: 1, scope: 60 as ScopeInMin};
        const valid = createFunctionBlueprint(2, 'average', params);
        const func = buildIndicatorFunction(valid);
        expect(func(steps)).toEqual(2 * 10);
    });

    it('should reject if name is not supported', function () {
        const invalid = getValidBlueprint();
        invalid.func = 'abc' as FunctionOption;
        expect(() => buildIndicatorFunction(invalid)).toThrowError();
    });

    it('should reject if factor is not supported', function () {
        const invalid = getValidBlueprint();
        invalid.params.factor = 50000000;
        expect(() => buildIndicatorFunction(invalid)).toThrowError();
    });

    it('should reject if supportedParams is not supported', function () {
        const invalid = getValidBlueprint();
        invalid.params = {factor: 1, scope: 61 as ScopeInMin};
        expect(() => buildIndicatorFunction(invalid)).toThrowError();
    });
});
