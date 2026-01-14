import {lookupIndicatorFunction} from './lookup-functions';
import {FunctionBlueprint, FunctionFactory, IndicatorFunction} from './interfaces';


export function buildIndicatorFunction(blueprint: FunctionBlueprint): IndicatorFunction {
    const functionFactory = getFactory(blueprint);
    return functionFactory.build(blueprint.params);
}

// private

function getFactory(blueprint: FunctionBlueprint): FunctionFactory {
    return lookupIndicatorFunction[blueprint.func]();
}
