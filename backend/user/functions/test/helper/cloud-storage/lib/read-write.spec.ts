import {useCloudStorageMock} from '../../../test-utils/mocks/cloud-storage/use-cloud-storage-mock';
import {writeCloudStorage} from '../../../../src/helper/cloud-storage/lib/write';
import {readCloudStorage} from '../../../../src/helper/cloud-storage/lib/read';

describe('Test cloud storage read/ write with fake', function () {
    const path = 'test/dest/here.json';

    beforeEach(function () {
        useCloudStorageMock();
    });

    it('should write and read file', async function () {
        const data = {testMe: Math.random() * 123};
        await writeCloudStorage(path, data);
        const result = await readCloudStorage(path);
        expect(result).toEqual(data);
    });

    it('should handle NaN values', async function () {
        const data = {testMe: NaN, array: [0, NaN, 1, 2]};
        await writeCloudStorage(path, data);
        const result = await readCloudStorage(path);
        expect(result).toEqual(data);
    });

    it('should overwrite existing', async function () {
        const data = {testMe: Math.random() * 123};
        await writeCloudStorage(path, data);
        await writeCloudStorage(path, {yeah: 123});
        const result = await readCloudStorage(path);
        expect(result).toEqual({yeah: 123});
    });

    it('should handle backslash in path', async function () {
        const pathBack = 'sometimes\\windows';
        const data = {testMe: Math.random() * 123};
        await writeCloudStorage(pathBack, data);
        const result = await readCloudStorage(pathBack);
        expect(result).toEqual(data);
    });

    it('should write and read multiple files', async function () {
        const path2 = 'uff';
        const data = {testMe: Math.random() * 123};
        const data2 = {testMe: Math.random() * 123, wusch: [{miau: 123}]};
        await writeCloudStorage(path, data);
        await writeCloudStorage(path2, data2);
        const result = await readCloudStorage(path);
        const result2 = await readCloudStorage(path2);
        expect(result).toEqual(data);
        expect(result2).toEqual(data2);
    });
});