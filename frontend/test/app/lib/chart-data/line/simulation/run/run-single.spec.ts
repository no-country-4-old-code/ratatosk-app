import {runOnSimulatedData} from '@app/lib/chart-data/line/simulation/run/run-single';
import {lookupStepWidthInMinutesOfRange} from '../../../../../../../../shared-library/src/settings/sampling';
import {createArray, createRangeArray} from '../../../../../../../../shared-library/src/functions/general/array';
import {ScopeInMin} from '../../../../../../../../shared-library/src/scan/indicator-functions/params/interfaces-params';
import {FunctionBlueprint} from '../../../../../../../../shared-library/src/scan/indicator-functions/interfaces';
import {TimeRange, TimeSteps} from '../../../../../../../../shared-library/src/datatypes/time';
import {lowestTimeRange} from '../../../../../../../../shared-library/src/functions/time/get-time-ranges';
import {createEmptyTimeSteps} from '../../../../../../../../shared-library/src/functions/time/steps';


describe('Test run simulation for single function', function () {
    const range: TimeRange = lowestTimeRange;
    let array: TimeSteps[];
    let blueprint: FunctionBlueprint;

    function act(stepArray: TimeSteps[], expected: number[]): void {
        const result = runOnSimulatedData(range, blueprint, stepArray);
        expect(result).toEqual(expected);
    }

    beforeEach(function () {
        array = createArray(3).map(() => createEmptyTimeSteps());
    });

    describe('Test simulation data for value-function', function () {

        beforeEach(function () {
            blueprint = {func: 'value', params: {factor: 1}};
        });

        it('should return empty array if no steps given', function () {
            act([], []);
        });

        it('should apply to single step', function () {
            const steps = createEmptyTimeSteps();
            steps[range] = [-1, 2, 42];
            act([steps], [-1]);
        });

        it('should apply to multiple steps', function () {
            array[0][range] = [-1];
            array[1][range] = [2];
            array[2][range] = [42];
            act(array, [-1, 2, 42]);
        });

        it('should return NaN if not enough samples available', function () {
            array[0][range] = [-1];
            array[1][range] = [2];
            array[2][range] = [];
            act(array, [-1, 2, NaN]);
        });

        it('should return NaN if NaN included', function () {
            array[0][range] = [-1];
            array[1][range] = [NaN];
            array[2][range] = [42];
            act(array, [-1, NaN, 42]);
        });
    });

    describe('Test simulation data for average-function', function () {
        const scope: ScopeInMin = 60;
        const numberOfSamples = scope / lookupStepWidthInMinutesOfRange[range];

        beforeEach(function () {
            blueprint = {func: 'average', params: {factor: 1, scope}};
        });

        it('should return empty array if no steps given', function () {
            act([], []);
        });

        it('should apply to single step', function () {
            const steps = createEmptyTimeSteps();
            steps[range] = createRangeArray(numberOfSamples);
            act([steps], [5.5]);
        });

        it('should apply to single step and ignore redundant samples', function () {
            const steps = createEmptyTimeSteps();
            steps[range] = createRangeArray(numberOfSamples + 1);
            act([steps], [5.5]);
        });

        it('should apply to multiple steps', function () {
            array[0][range] = createRangeArray(numberOfSamples);
            array[1][range] = createArray(numberOfSamples, -2);
            array[2][range] = createRangeArray(numberOfSamples, 10);
            act(array, [5.5, -2, 15.5]);
        });

        it('should return NaN if not enough samples available', function () {
            array[0][range] = createRangeArray(numberOfSamples);
            array[1][range] = createArray(numberOfSamples, -2);
            array[2][range] = createRangeArray(numberOfSamples - 1, 10);
            act(array, [5.5, -2, NaN]);
        });

        it('should return NaN if NaN included', function () {
            array[0][range] = createRangeArray(numberOfSamples);
            array[1][range] = createArray(numberOfSamples, -2);
            array[2][range] = createRangeArray(numberOfSamples, 10);
            array[1][range][2] = NaN;
            act(array, [5.5, NaN, 15.5]);
        });
    });
});
