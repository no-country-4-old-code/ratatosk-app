import {hashFnv32a} from '../../src/functions/hash';

describe('Test hashing of string', function () {

    it('should handle empty string', function () {
        const hash = hashFnv32a('');
        expect(hash).toEqual('811c9dc5');
    });

    it('should hash string to 8 char long hash', function () {
        const hash = hashFnv32a('hans.wurst@yahooo.com') as string;
        expect(hash.length).toEqual(8);
    });

    it('should spread hashes even if emails nearly similar', function () {
        const hash1 = hashFnv32a('hans.wurst@yahooo.com') as string;
        const hash2 = hashFnv32a('hans.worst@yahooo.com') as string;
        const hash3 = hashFnv32a('hans.wurst2@yahooo.com') as string;
        expect(hash1).not.toEqual(hash2);
        expect(hash1).not.toEqual(hash3);
        expect(hash2).not.toEqual(hash3);
    });

    it('should be reproducable (same input, same hash)', function () {
        const hash1 = hashFnv32a('hans.wurst@yahooo.com') as string;
        const hash2 = hashFnv32a('hans.worst@yahooo.com') as string;
        const hash3 = hashFnv32a('hans.wurst@yahooo.com') as string;
        expect(hash1).not.toEqual(hash2);
        expect(hash1).toEqual(hash3);
    });
});