import {getFactorMinMax, getScopes, getThresholdMinMax, getWeights} from './get-params';
import {ParamOption, ScopeInMin} from './interfaces-params';
import {isValueInRange} from './min-max';

type LookupPlausiCheck = { [param in ParamOption]: (val: any) => boolean };


export const lookupParamCheck: LookupPlausiCheck = {
    scope: (scope: ScopeInMin) => getScopes().includes(scope),
    weight: (weight: number) => getWeights().includes(weight),
    factor: (factor: number) => isValueInRange(factor, getFactorMinMax()),
    threshold: (threshold: number) => isValueInRange(threshold, getThresholdMinMax()),
};


