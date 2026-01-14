import {createRangeArray} from './array';

export function cluster2Groups<T>(ids: T[], groupSize: number): T[][] {
    const numberOfGroups = Math.ceil(ids.length / groupSize);
    return createRangeArray(numberOfGroups, 0)
        .map(idx => idx * groupSize)
        .map(offset => ids.slice(offset, offset + groupSize));
}