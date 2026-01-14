import {FunctionFactory, FunctionInfo, IndicatorFunction} from '../interfaces';
import {assembleFunctionFactory} from '../helper/assemble-factory';
import {Params} from '../params/interfaces-params';


export function createThreshold(): FunctionFactory {
    return assembleFunctionFactory(buildFunction, getFunctionInfo);
}

// private

function buildFunction(params: Required<Params>): IndicatorFunction {
    return () => params.factor * params.threshold;
}

function getFunctionInfo(): FunctionInfo {
    return {
        name: 'threshold',
        supportedParams: ['factor', 'threshold']
    };
}

