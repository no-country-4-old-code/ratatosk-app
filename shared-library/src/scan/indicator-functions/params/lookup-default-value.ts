import {ParamOption} from './interfaces-params';
import {getScopes} from './get-params';

type LookupDefaultValue = { [param in ParamOption]: any };


export const lookupParamDefaultValue: LookupDefaultValue = {
    factor: 1,
    scope: getScopes()[0],
    threshold: 0,
    weight: 1
};

