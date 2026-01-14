import {deepCopy, mapKeys} from '../../../src/functions/general/object';

describe('Test object helper functions', function () {


    describe('Map keys', function () {

        it('should map keys', function () {
            const obj = {'miau': 12, 'wuff': 42};
            const expected = {'cat': 12, 'dog': 42};
            const lookup: any = {
                'miau': 'cat',
                'wuff': 'dog'
            };
            const result = mapKeys(obj, (keys: string[]) => keys.map(k => lookup[k]));
            expect(result).toEqual(expected);
        });

    });

    describe('Copy', function () {

        it('should copy object', function () {
            const obj = {'miau': [1, 2, 3, {'harr': 12}, 'miau2'], 'uff': 3, 'NaN': NaN, 'date': new Date()};
            const obj2 = deepCopy(obj);
            expect(obj).toEqual(obj2);
        });
    });
});
