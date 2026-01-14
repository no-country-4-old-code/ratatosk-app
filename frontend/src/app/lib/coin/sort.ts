import {MetricCoinSnapshot} from '../../../../../shared-library/src/asset/assets/coin/interfaces';

const lookupSortingFunction: Record<string, (a: number, b: number) => number> = {
    'true': (a: number, b: number) => a - b,
    'false': (a: number, b: number) => b - a,
};

export interface SortRequest {
    readonly metric: MetricCoinSnapshot;
    readonly ascending: boolean;
}

export function sortElements<T>(elements: T[], accessor: (e: T) => any, ascending: boolean): T[] {
    const compareFunc = lookupSortingFunction[String(ascending)];
    elements.sort((a, b) => compareFunc(accessor(a), accessor(b)));
    return elements;
}
