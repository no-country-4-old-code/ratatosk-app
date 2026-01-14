import {
    createArray,
    createRangeArray,
    getElementsWhichAreOnlyInFirstArray,
    getSetOfElements
} from '../../../src/functions/general/array';

describe('Test array functions', function () {

    describe('Test createArray', function () {

        function act(length: number, fill: number, expected: number[]): void {
            const result = createArray(length, fill);
            expect(result).toEqual(expected);
        }

        it('should create array of length and fill all values', function () {
            act(0, NaN, []);
            act(1, NaN, [NaN]);
            act(3, NaN, [NaN, NaN, NaN]);
            act(3, 42, [42, 42, 42]);
        });
    });

    describe('Test createRangeArray', function () {

        function act(length: number, offset: number, expected: number[]): void {
            const result = createRangeArray(length, offset);
            expect(result).toEqual(expected);
        }

        it('should create array of length and fill it with increasing numbers starting at offset', function () {
            act(0, 0, []);
            act(1, 0, [0]);
            act(3, 0, [0, 1, 2]);
            act(3, 42, [42, 43, 44]);
        });
    });

    describe('Test getElementsWhichAreOnlyInFirstArray', function () {

        function act(first: number[], second: number[], expected: number[]): void {
            const result = getElementsWhichAreOnlyInFirstArray(first, second);
            expect(result).toEqual(expected);
        }

        it('should return only elements which are in the first but not in the second array', function () {
            act([], [], []);
            act([1], [], [1]);
            act([], [1], []);
            act([1, 2], [1], [2]);
            act([1], [1, 2], []);
            act([1, 2, 2], [1, 2], []);
            act([1, 2, 2], [1], [2, 2]);
            act([1, 2, 3, 4], [5, 2], [1, 3, 4]);
        });
    });

    describe('Test getSetOfElements', function () {

        function act(array: number[], expected: number[]): void {
            const result = getSetOfElements(array);
            expect(result).toEqual(expected);
        }

        it('should return every element of array only once', function () {
            act([], []);
            act([1], [1]);
            act([1, 1], [1]);
            act([1, 2], [1, 2]);
            act([1, 2, 3, 2], [1, 2, 3]);
        });
    });
});