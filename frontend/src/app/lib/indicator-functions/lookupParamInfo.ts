import {ParamOption} from '../../../../../shared-library/src/scan/indicator-functions/params/interfaces-params';

type LookupParamInfo = { [param in ParamOption]: string };

export const lookupParamInfo: LookupParamInfo = {
    factor: 'The result of the selected function is multiplied by this factor.',
    scope: 'Determine the period of time to which the selected function is applied.',
    threshold: 'A static value which is used as threshold.',
    weight: 'The standard deviation is multiplied by this factor before being applied.',
};

