import {average, std, sum} from '../../../../src/scan/indicator-functions/helper/math';

describe('Test math functions', function () {

    describe('Test sum', function () {
        it('should add all given numbers', function () {
            expect(sum([])).toEqual(0);
            expect(sum([0])).toEqual(0);
            expect(sum([0, 1])).toEqual(1);
            expect(sum([-1, 1])).toEqual(0);
            expect(sum([-1, 0])).toEqual(-1);
            expect(sum([1, 10, 100, 1000])).toEqual(1111);
        });
    });

    describe('Test average', function () {
        it('should return average of all given numbers', function () {
            expect(average([])).toEqual(NaN);
            expect(average([0])).toEqual(0);
            expect(average([0, 1])).toEqual(0.5);
            expect(average([-1, 1])).toEqual(0);
            expect(average([-1, 0])).toEqual(-0.5);
            expect(average([5, 10, 5, 10])).toEqual(7.5);
            expect(average([5, 5, 5, 5, 5])).toEqual(5);
        });
    });

    describe('Test std', function () {
        it('should return standard deviation of all given numbers', function () {
            expect(std([])).toEqual(NaN);
            expect(std([0])).toEqual(0);
            expect(std([0, 1])).toEqual(0.5);
            expect(std([-1, 1])).toEqual(1);
            expect(std([-1, 0])).toEqual(0.5);
            expect(std([5, 10, 5, 10])).toEqual(2.5);
            expect(std([5, 5, 5, 5, 5])).toEqual(0);
        });
    });
});
