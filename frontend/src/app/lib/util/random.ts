import {throwErrorIfInvalid} from '@app/lib/util/error';

export function getUniqueRandomNumbers(n: number, max: number): number[] {
    throwErrorIfInvalid(n <= max, 'Never ending parameters');
    const unique = [];
    while (unique.length < n) {
        const value = Math.round(Math.random() * max);
        if (!unique.includes(value)) {
            unique.push(value);
        }
    }
    return unique;
}
