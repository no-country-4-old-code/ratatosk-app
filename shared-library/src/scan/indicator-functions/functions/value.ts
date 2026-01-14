import {FunctionFactory, FunctionInfo, IndicatorFunction} from '../interfaces';
import {Params} from '../params/interfaces-params';
import {assembleFunctionFactory} from '../helper/assemble-factory';
import {checkNumberOfAvailableSamples} from '../helper/check-number-of-samples';
import {TimeSteps} from '../../../datatypes/time';
import {lowestTimeRange} from '../../../functions/time/get-time-ranges';


export function createValue(): FunctionFactory {
    return assembleFunctionFactory(buildFunction, getInfo);
}

// private

function buildFunction(params: Required<Params>): IndicatorFunction {
    return (steps: TimeSteps): number => {
        // TODO: Make function independent of attribute and remove all this ATTRIBUTE stuff...
        const samples = steps[lowestTimeRange];
        checkNumberOfAvailableSamples(1, samples, 'value');
        return params.factor * samples[0];
    };
}

function getInfo(): FunctionInfo {
    return {
        name: 'value',
        supportedParams: ['factor']
    };
}

