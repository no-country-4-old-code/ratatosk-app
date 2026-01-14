import {CloudStorageBucketMock} from './cloud-storage';
import {cloudStorageApi} from '../../../../src/helper/cloud-storage/lib/api';
import {Bucket} from '@google-cloud/storage';
import os from 'os';
import {mapToPromise} from '../../../../../../../shared-library/src/functions/map-to-promise';
import {FileApi} from '../../../../src/helper/file/api';

export function useCloudStorageMock(): CloudStorageBucketMock {
    const mock = new CloudStorageBucketMock();
    spyOn(cloudStorageApi, 'getBucket').and.returnValue(mock as any as Bucket);
    spyOn(os, 'tmpdir').and.returnValue('');
    useFsMock();
    return mock;
}

function useFsMock(): void {
    const container: any = {};
    spyOn(FileApi, 'writeFile').and.callFake((path: string, data: any) => {
        container[path] = data;
        return mapToPromise({});
    });
    spyOn(FileApi, 'readFile').and.callFake((path: string): any => mapToPromise(container[path]));
    spyOn(FileApi, 'deleteFile').and.callFake((path: string) => {
        delete container[path];
        return mapToPromise({});
    });
}