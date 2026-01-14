import {getFunctionOptions} from '../../../src/scan/indicator-functions/lookup-functions';
import {buildIndicatorFunction} from '../../../src/scan/indicator-functions/build';
import {createFunctionBlueprint} from '../../../src/functions/test-utils/dummy-data/condition';
import {createArray} from '../../../src/functions/general/array';
import {Params} from '../../../src/scan/indicator-functions/params/interfaces-params';
import {lowestTimeRange} from '../../../src/functions/time/get-time-ranges';
import {createEmptyTimeSteps} from '../../../src/functions/time/steps';
import {FunctionOption} from '../../../src/scan/indicator-functions/interfaces';

describe('Build indicator-functions function should be callable with all FunctionOptions, Attribute and' +
    ' TimeRanges and only use history for this setting ', function () {
    const scope = 60;
    const lookupCreateParams: { [func in FunctionOption]: Params } = {
        'threshold': ({factor: 1, threshold: 1}),
        'value': ({factor: 1}),
        'average': ({factor: 1, scope}),
        'pastValue': ({factor: 1, scope}),
        'max': ({factor: 1, scope}),
        'min': ({factor: 1, scope}),
        'deviation': ({factor: 1, scope, weight: 1}),
    };
    const expectedResult: { [func in FunctionOption]: number } = {
        'threshold': 1,
        'value': 1,
        'average': 1,
        'pastValue': 1,
        'max': 1,
        'min': 1,
        'deviation': 1
    };

    getFunctionOptions().forEach((option: FunctionOption) => {
        it(`should support build of ${option} for all attributes`, function () {
            const params = lookupCreateParams[option];
            const blueprint = createFunctionBlueprint(1, option, params);
            const func = buildIndicatorFunction(blueprint);
            const steps = createEmptyTimeSteps();
            steps[lowestTimeRange] = createArray(13, 1);
            expect(func(steps)).toEqual(expectedResult[option]);
        });
    });
});
