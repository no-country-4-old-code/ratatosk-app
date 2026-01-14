import {FunctionOption} from '../../../../../shared-library/src/scan/indicator-functions/interfaces';

type LookupFunctionInfo = { [func in FunctionOption]: string };

export const lookupFunctionInfo: LookupFunctionInfo = {
    threshold: 'a configurable static value.',
    value: 'the current value.',
    average: 'the simple moving average (SMA) over a configurable period of time.',
    pastValue: 'a value from a configurable time ago.',
    min: 'the minimal value of a configurable period of time.',
    max: 'the maximal value of a configurable period of time.',
    deviation: 'the simple moving average +/- the weighted standard deviation over a configurable period of time.'
};
