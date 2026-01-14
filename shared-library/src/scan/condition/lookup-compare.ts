import {getKeysAs} from '../../functions/general/object';
import {CompareOption} from './interfaces';

type LookupCompare = { [option in CompareOption]: (a: number, b: number) => boolean };

export const lookupCompareFunction: LookupCompare = {
    '>': (a: number, b: number) => a > b,
    '<': (a: number, b: number) => a < b,
    '>=': (a: number, b: number) => a >= b,
    '<=': (a: number, b: number) => a <= b
};

export function getCompareOptions(): CompareOption[] {
    return getKeysAs<CompareOption>(lookupCompareFunction);
}
