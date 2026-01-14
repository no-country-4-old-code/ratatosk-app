import {getCompareOptions, lookupCompareFunction} from '../../../../src/scan/condition/lookup-compare';
import {CompareOption} from '../../../../src/scan/condition/interfaces';


describe('Test conditions compare functions', function () {

    it('should resolve > ', function () {
        const compare = lookupCompareFunction['>'];
        expect(compare(-1, -2)).toBeTruthy();
        expect(compare(-1, -1)).toBeFalsy();
        expect(compare(-1, 0)).toBeFalsy();
        expect(compare(0, 0)).toBeFalsy();
        expect(compare(1, 0)).toBeTruthy();
        expect(compare(123, 122)).toBeTruthy();
        expect(compare(123, 123)).toBeFalsy();
        expect(compare(-123, 123)).toBeFalsy();
        expect(compare(123, -123)).toBeTruthy();
    });

    it('should resolve >= ', function () {
        const compare = lookupCompareFunction['>='];
        expect(compare(-1, -2)).toBeTruthy();
        expect(compare(-1, -1)).toBeTruthy();
        expect(compare(-1, 0)).toBeFalsy();
        expect(compare(0, 0)).toBeTruthy();
        expect(compare(1, 0)).toBeTruthy();
        expect(compare(123, 122)).toBeTruthy();
        expect(compare(123, 123)).toBeTruthy();
        expect(compare(123, 124)).toBeFalsy();
        expect(compare(-123, 123)).toBeFalsy();
        expect(compare(123, -123)).toBeTruthy();
    });

    it('should resolve < ', function () {
        const compare = lookupCompareFunction['<'];
        expect(compare(-2, -1)).toBeTruthy();
        expect(compare(-1, -1)).toBeFalsy();
        expect(compare(0, -1)).toBeFalsy();
        expect(compare(0, 0)).toBeFalsy();
        expect(compare(0, 1)).toBeTruthy();
        expect(compare(122, 123)).toBeTruthy();
        expect(compare(123, 123)).toBeFalsy();
        expect(compare(123, -123)).toBeFalsy();
        expect(compare(-123, 123)).toBeTruthy();
    });

    it('should resolve <= ', function () {
        const compare = lookupCompareFunction['<='];
        expect(compare(-2, -1)).toBeTruthy();
        expect(compare(-1, -1)).toBeTruthy();
        expect(compare(0, -1)).toBeFalsy();
        expect(compare(0, 0)).toBeTruthy();
        expect(compare(0, 1)).toBeTruthy();
        expect(compare(122, 123)).toBeTruthy();
        expect(compare(123, 123)).toBeTruthy();
        expect(compare(124, 123)).toBeFalsy();
        expect(compare(123, -123)).toBeFalsy();
        expect(compare(-123, 123)).toBeTruthy();
    });


    it('should return "false" whenever at least one indicator-functions is NaN', function () {
        getCompareOptions().forEach((opt: CompareOption) => {
            const compare = lookupCompareFunction[opt];
            expect(compare(NaN, NaN)).toBeFalsy();
            expect(compare(NaN, -1)).toBeFalsy();
            expect(compare(NaN, 0)).toBeFalsy();
            expect(compare(NaN, 1)).toBeFalsy();
            expect(compare(-1, NaN)).toBeFalsy();
            expect(compare(0, NaN)).toBeFalsy();
            expect(compare(1, NaN)).toBeFalsy();
        });

    });
});



