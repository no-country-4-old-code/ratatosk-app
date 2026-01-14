import {createRangeArray} from '../general/array';

export function compressNumbersU8(numbers: number[]): string {
    return String.fromCharCode(...numbers);
}

export function decompressNumbersU8(charsUtf8: string): number[] {
    return createRangeArray(charsUtf8.length).map(idx => charsUtf8.charCodeAt(idx));
}

// private
