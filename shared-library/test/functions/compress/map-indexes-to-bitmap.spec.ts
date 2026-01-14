import {mapBitmap2Indexes, mapIndexes2Bitmap} from '../../../src/functions/compress/map-indexes-to-bitmap';
import {createRangeArray} from '../../../src/functions/general/array';
import {deepCopy} from '../../../src/functions/general/object';

describe('Test mapping index to bitmap number array', function () {

    function act(indexes: number[], expectedBitmap: number[]): void {
        const bitmap = mapIndexes2Bitmap(indexes);
        expect(bitmap).toEqual(expectedBitmap);
    }

    it('should return empty array if empty array is given', function () {
        act([], []);
    });

    it('should map bit index to byte value', function () {
        act([0], [1]);
        act([1], [2]);
        act([2], [4]);
        act([3], [8]);
        act([4], [16]);
        act([5], [32]);
        act([6], [64]);
        act([7], [128]);
    });

    it('should write in next element if bit index exceed 7', function () {
        act([8], [0, 1]);
        act([9], [0, 2]);
        act([15], [0, 128]);
        act([16], [0, 0, 1]);
        act([17], [0, 0, 2]);
    });

    it('should map multiple indexes into one byte', function () {
        act([0, 1], [3]);
        act([0, 1, 7], [131]);
        act([0, 2, 8], [5, 1]);
    });

    it('should be reversible', function () {
        const data = [
            [],
            [0],
            [1],
            [7],
            [8],
            [0, 1],
            [1, 2],
            [0, 7],
            [0, 8, 9],
            createRangeArray(42)
        ];
        data.forEach(dataset => {
            const copy = deepCopy(dataset);
            const bitmap = mapIndexes2Bitmap(copy);
            const result = mapBitmap2Indexes(bitmap);
            expect(result).toEqual(dataset);
        });
    });
});
