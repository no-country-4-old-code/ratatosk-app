import {lookupIndicatorFunction} from './lookup-functions';
import {FunctionInfo, FunctionOption} from './interfaces';

export function getInfoOfFunction(funcName: FunctionOption): FunctionInfo {
    return lookupIndicatorFunction[funcName]().getInfo();
}
