import {ReversePipe} from '@app/shared/pipes/reverse.pipe';

describe('ReversePipe', () => {
    let pipe: ReversePipe;

    beforeEach(() => {
        pipe = new ReversePipe();
    });

    it('function transform should return [\'444\', 3, 2, 1] when given [1, 2, 3, \'444\']', () => {
        const value = [1, 2, 3, '444'];
        const result = pipe.transform(value);
        expect(result).toEqual(['444', 3, 2, 1]);
    });

    it('function transform should return [124] when given [124]', () => {
        const value = [124];
        const result = pipe.transform(value);
        expect(result).toEqual([124]);
    });

    it('function transform should return [] when given []', () => {
        const value = [];
        const result = pipe.transform(value);
        expect(result).toEqual([]);
    });

});
