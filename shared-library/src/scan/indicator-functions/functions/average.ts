import {average} from '../helper/math';
import {FunctionFactory, FunctionInfo, IndicatorFunction} from '../interfaces';
import {Params} from '../params/interfaces-params';
import {lookupStepWidthInMinutesOfRange} from '../../../settings/sampling';
import {assembleFunctionFactory} from '../helper/assemble-factory';
import {iterateOverRanges} from '../helper/iterate-over-ranges';
import {TimeRange, TimeSteps} from '../../../datatypes/time';
import {checkNumberOfAvailableSamples} from '../helper/check-number-of-samples';


export function createAverage(): FunctionFactory {
    return assembleFunctionFactory(buildFunction, getFunctionInfo);
}

// private

function buildFunction(params: Required<Params>): IndicatorFunction {
    return (steps: TimeSteps): number => {
        let averageComplete = 0;

        const callback = (range: TimeRange, timeUsedInRange: number, timeAll: number): void => {
            const weight = timeUsedInRange / timeAll;
            const numberOfSamplesNeeded = Math.ceil(timeUsedInRange / lookupStepWidthInMinutesOfRange[range]);
            const samples = steps[range].slice(0, numberOfSamplesNeeded);
            checkNumberOfAvailableSamples(numberOfSamplesNeeded, samples, 'average');
            const averageRange = average(samples);
            averageComplete += weight * averageRange;
        };

        iterateOverRanges(params.scope, callback);
        return params.factor * averageComplete;
    };
}

function getFunctionInfo(): FunctionInfo {
    return {
        name: 'average',
        supportedParams: ['factor', 'scope']
    };
}
