import {createAverage} from './functions/average';
import {createValue} from './functions/value';
import {FunctionFactory, FunctionOption} from './interfaces';
import {createThreshold} from './functions/threshold';
import {createPastValue} from './functions/past-value';
import {createStableMax} from './functions/stable-max';
import {createStableMin} from './functions/stable-min';
import {createDeviation} from './functions/deviation';
import {getKeysAs} from '../../functions/general/object';


type LookupFunctions = { [option in FunctionOption]: () => FunctionFactory };

export const lookupIndicatorFunction: LookupFunctions = {
    'value': createValue,
    'average': createAverage,
    'threshold': createThreshold,
    'pastValue': createPastValue,
    'min': createStableMin,
    'max': createStableMax,
    'deviation': createDeviation
};

export function getFunctionOptions(): FunctionOption[] {
    return getKeysAs<FunctionOption>(lookupIndicatorFunction);
}
