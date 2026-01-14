export function createArray(length: number, fill = NaN): number[] {
    return new Array<number>(length).fill(fill);
}

export function createRangeArray(length: number, offset = 0): number[] {
    const array = Array.from(Array(length).keys());
    return array.map(val => val + offset);
}

export function areArraysEqual<T>(oldArray: T[], newArray: T[]): boolean {
    return JSON.stringify(oldArray) === JSON.stringify(newArray);
}

export function getElementsWhichAreOnlyInFirstArray<T>(first: T[], second: T[]): T[] {
    return first.filter(element => !second.includes(element));
}

export function getSetOfElements<T>(array: T[]): T[] {
    const arrayStr = array.map(obj => JSON.stringify(obj));
    return array.filter((obj, index) => {
        const objStr = JSON.stringify(obj);
        return arrayStr.indexOf(objStr) === index;
    });
}
