import {CompareOption} from '../../../../../shared-library/src/scan/condition/interfaces';

type LookupCompareInfo = { [compare in CompareOption]: string };

export const lookupCompareInfo: LookupCompareInfo = {
    '<': 'Condition is matched if left value is less then right value.',
    '<=': 'Condition is matched if left value is less then or equal to right value.',
    '>': 'Condition is matched if left value is greater then right value.',
    '>=': 'Condition is matched if left value is greater then or equal to right value.'
};
