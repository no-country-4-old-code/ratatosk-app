import {ParamOption, Params} from './interfaces-params';
import {lookupParamCheck} from './lookup-plausi-check';
import {FunctionInfo} from '../interfaces';


export function checkParams(params: Params, functionInfo: FunctionInfo): Required<Params> {
    if (!areAllNeededParamsValid(params, functionInfo.supportedParams)) {
        throwParamError(functionInfo.name, params);
    }
    return params as Required<Params>;
}


// private


function areAllNeededParamsValid(params: Params, neededParams: ParamOption[]): boolean {
    let areValid = false;
    if (haveAllNeededParams(params, neededParams) && haveOnlyNeededParams(params, neededParams)) {
        areValid = areAllNeededValid(params, neededParams);
    }
    return areValid;
}

function areAllNeededValid(params: Params, neededParams: ParamOption[]): boolean {
    return neededParams.every(option => isParamValid(option, params[option]));
}

function isParamValid(name: ParamOption, paramValue: any): boolean {
    return lookupParamCheck[name](paramValue);
}

function haveAllNeededParams(params: Params, neededParams: ParamOption[]): boolean {
    return neededParams.every(p => Object.keys(params).includes(p));
}

function haveOnlyNeededParams(params: Params, neededParams: ParamOption[]): boolean {
    return Object.keys(params).every(p => neededParams.includes(p as ParamOption));
}

function throwParamError(functionName: string, params: Params) {
    const msg = 'Params for <' + functionName + '> are invalid: ' + JSON.stringify(params);
    throw new Error(msg);
}

