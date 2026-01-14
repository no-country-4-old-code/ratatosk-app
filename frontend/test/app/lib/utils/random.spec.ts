import {getUniqueRandomNumbers} from '@app/lib/util/random';

describe('Test get unique random numbers', function () {

    it('should return only unique integer numbers', function () {
        const numbers = getUniqueRandomNumbers(1000, 2000);
        numbers.forEach((num, index, self) => {
            expect(self.indexOf(num)).toEqual(index);
            expect(Number.isInteger(num)).toBeTruthy();
        });
    });

    it('should return array of given length', function () {
        const act = (n) => getUniqueRandomNumbers(n, 100).length;
        expect(act(0)).toEqual(0);
        expect(act(1)).toEqual(1);
        expect(act(2)).toEqual(2);
        expect(act(100)).toEqual(100);
    });

    it('should throw error if max is small n', function () {
        const act = () => getUniqueRandomNumbers(101, 100);
        expect(act).toThrowError();
    });

    it('should randomly pick values', function () {
        const numbers1 = getUniqueRandomNumbers(1, 1000000000);
        const numbers2 = getUniqueRandomNumbers(1, 1000000000);
        expect(numbers1).not.toEqual(numbers2);
    });
});
