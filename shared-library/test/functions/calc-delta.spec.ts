import {calcDelta} from '../../src/functions/calc-delta';

describe('Test calc delta for coin details', function () {
    const func = calcDelta;

    describe('Test special cases', function () {
        it('should return NaN if no old values are given', () => {
            expect(func(1, [])).toEqual(NaN);
        });

        it('should return Infinity if new value is positive and compared to 0', () => {
            expect(func(1, [2, 3, 0])).toEqual(Infinity);
        });

        it('should return negative Infinity if new value is negative and compared to 0', () => {
            expect(func(-1, [2, 3, 0])).toEqual(-Infinity);
        });
    });

    describe('Test selector-condition-option cases', function () {
        it('should return 0 if new value and last value are the same', () => {
            expect(func(33, [2, 3, 33])).toEqual(0);
            expect(func(-42, [2, 3, -42])).toEqual(-0);
        });

        it('should return -1 if new value is 0', () => {
            expect(func(0, [2, 3, 42])).toEqual(-1);
            expect(func(0, [2, 3, -42])).toEqual(-1);
        });

        it('should return relative diff between new value and last value (grow by 50%)', () => {
            expect(func(1.5, [4, 3, 1])).toEqual(0.5);
            expect(func(3, [4, 3, 2])).toEqual(0.5);
            expect(func(75, [4, 3, 50])).toEqual(0.5);
        });

        it('should return relative diff between new value and last value (shrink by 50%)', () => {
            expect(func(0.5, [4, 3, 1])).toEqual(-0.5);
            expect(func(1, [4, 3, 2])).toEqual(-0.5);
            expect(func(25, [4, 3, 50])).toEqual(-0.5);
        });

        it('should return relative diff between new value and last value (other)', () => {
            expect(func(10, [4, 3, 1])).toEqual(9);
            expect(func(-2, [4, 3, 2])).toEqual(-2);
        });
    });
});
