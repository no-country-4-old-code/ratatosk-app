import {FunctionFactory, FunctionInfo, IndicatorFunction} from '../interfaces';
import {assembleFunctionFactory} from '../helper/assemble-factory';
import {Params} from '../params/interfaces-params';
import {average, std} from '../helper/math';
import {TimeRange, TimeSteps} from '../../../datatypes/time';
import {lookupStepWidthInMinutesOfRange} from '../../../settings/sampling';
import {iterateOverRanges} from '../helper/iterate-over-ranges';
import {checkNumberOfAvailableSamples} from '../helper/check-number-of-samples';


export function createDeviation(): FunctionFactory {
    return assembleFunctionFactory(buildFunction, getFunctionInfo);
}

// private

function buildFunction(params: Required<Params>): IndicatorFunction {
    return (steps: TimeSteps): number => {
        let deviation = 0;

        const callback = (range: TimeRange, timeUsedInRange: number, timeAll: number): void => {
            const weight = timeUsedInRange / timeAll;
            const numberOfSamplesNeeded = Math.ceil(timeUsedInRange / lookupStepWidthInMinutesOfRange[range]);
            const samples = steps[range].slice(0, numberOfSamplesNeeded);
            checkNumberOfAvailableSamples(numberOfSamplesNeeded, samples, 'deviation');
            const averageRange = average(samples);
            const factor = params.weight;
            const stdRange = std(samples);
            deviation += weight * (averageRange + factor * stdRange);
        };

        iterateOverRanges(params.scope, callback);
        return params.factor * deviation;
    };
}

function getFunctionInfo(): FunctionInfo {
    return {
        name: 'deviation',
        supportedParams: ['factor', 'scope', 'weight']
    };
}

