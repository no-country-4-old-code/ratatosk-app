import {compressNumbersU8, decompressNumbersU8} from '../../../src/functions/compress/compress-numbers-u8';
import {createRangeArray} from '../../../src/functions/general/array';

describe('Test compress / decompress numbers u8 to chars (1 Byte)', function () {

    describe('Test compress', function () {

        function act(numbers: number[], expected: string): void {
            const result = compressNumbersU8(numbers);
            expect(result).toEqual(expected);
        }

        it('should return no bytes if no numbers are given', function () {
            act([], '');
        });

        it('should convert to utf-8 charters', function () {
            act([65, 66, 67], 'ABC');
        });

        it('should handle not u8 values without exception (too big values)', function () {
            act([656667], 'ԛ');
        });

        it('should handle not u8 values without exception (negative values)', function () {
            act([-2], '￾');
        });
    });

    describe('Test compress / decompress', function () {

        it('should be reversible', function () {
            const numbers = createRangeArray(255);
            const compressed = compressNumbersU8(numbers);
            const result = decompressNumbersU8(compressed);
            expect(numbers).toEqual(result);
        });
    });
});
