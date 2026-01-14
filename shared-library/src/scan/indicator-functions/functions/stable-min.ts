import {FunctionFactory, FunctionInfo, IndicatorFunction} from '../interfaces';
import {assembleFunctionFactory} from '../helper/assemble-factory';
import {Params} from '../params/interfaces-params';
import {TimeRange, TimeSteps} from '../../../datatypes/time';
import {lookupStepWidthInMinutesOfRange} from '../../../settings/sampling';
import {iterateOverRanges} from '../helper/iterate-over-ranges';


export function createStableMin(): FunctionFactory {
    return assembleFunctionFactory(buildFunction, getFunctionInfo);
}

// private

function buildFunction(params: Required<Params>): IndicatorFunction {
    return (steps: TimeSteps): number => {
        const values: number[] = [];

        const callback = (range: TimeRange, timeUsedInRange: number): void => {
            const numberOfSamplesNeeded = Math.ceil(timeUsedInRange / lookupStepWidthInMinutesOfRange[range]);
            const samples = steps[range].slice(0, numberOfSamplesNeeded);
            const minRange = Math.min(...samples);
            values.push(minRange);
        };

        iterateOverRanges(params.scope, callback);
        return params.factor * Math.min(...values);
    };
}

function getFunctionInfo(): FunctionInfo {
    return {
        name: 'min',
        supportedParams: ['factor', 'scope']
    };
}

