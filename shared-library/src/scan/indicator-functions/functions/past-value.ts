import {FunctionFactory, FunctionInfo, IndicatorFunction} from '../interfaces';
import {assembleFunctionFactory} from '../helper/assemble-factory';
import {Params} from '../params/interfaces-params';
import {TimeRange, TimeSteps} from '../../../datatypes/time';
import {lookupStepWidthInMinutesOfRange} from '../../../settings/sampling';
import {iterateOverRanges} from '../helper/iterate-over-ranges';
import {checkNumberOfAvailableSamples} from '../helper/check-number-of-samples';


export function createPastValue(): FunctionFactory {
    return assembleFunctionFactory(buildFunction, getFunctionInfo);
}

// private

function buildFunction(params: Required<Params>): IndicatorFunction {
    return (steps: TimeSteps): number => {
        let result = NaN;

        const callback = (range: TimeRange, timeUsedInRange: number, timeAll: number, timeAllLeft: number): void => {
            if (timeAllLeft <= 0) {
                const numberOfSamplesNeeded = Math.ceil(timeUsedInRange / lookupStepWidthInMinutesOfRange[range]);
                const samples = steps[range].slice(0, numberOfSamplesNeeded);
                checkNumberOfAvailableSamples(numberOfSamplesNeeded, samples, 'pastValue');
                result = samples[samples.length - 1];
            }
        };

        iterateOverRanges(params.scope, callback);
        return params.factor * result;
    };
}

function getFunctionInfo(): FunctionInfo {
    return {
        name: 'pastValue',
        supportedParams: ['factor', 'scope']
    };
}

