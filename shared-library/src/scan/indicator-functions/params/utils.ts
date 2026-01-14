import {ParamOption, Params} from './interfaces-params';
import {lookupParamDefaultValue} from './lookup-default-value';
import {lookupParamCheck} from './lookup-plausi-check';

export function getParamOptions(): ParamOption[] {
    return Object.keys(lookupParamCheck) as ParamOption[];
}

export function getParamsWithDefaultValues(paramOptions: ParamOption[]): Params {
    const params: Params = {};
    paramOptions.forEach((name: ParamOption) => {
        (params as any)[name] = lookupParamDefaultValue[name];
    });
    return params;
}
