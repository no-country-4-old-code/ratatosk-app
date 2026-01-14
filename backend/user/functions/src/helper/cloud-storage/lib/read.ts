import {cloudStorageApi} from './api';
import path from 'path';
import os from 'os';
import {FileApi} from '../../file/api';
import {Bucket} from '@google-cloud/storage';

export async function readCloudStorage(cloudStoragePath: string): Promise<any> {
    const bucket = cloudStorageApi.getBucket();
    return readCloudStorageFromBucket(cloudStoragePath, bucket);
}

export async function readCloudStorageFromBucket(cloudStoragePath: string, bucket: Bucket): Promise<any> {
    const tempFileName = mapPathToFileName(cloudStoragePath);
    const tempLocalFile = path.join(os.tmpdir(), tempFileName);
    const file = bucket.file(cloudStoragePath);

    return file.download({destination: tempLocalFile}).then(() => {
        return FileApi.readFile(tempLocalFile).then((buf: any) => {
            const obj = JSON.parse(buf.toString(), mapString2NaN);
            return FileApi.deleteFile(tempLocalFile).then(() => obj);
        });
    });
}

// private

function mapPathToFileName(path: string): string {
    return path.split('/').join('_').split('\\').join('_') + '.read';
}

function mapString2NaN(key: string, value: any): string {
    let ret = value;
    if (ret === '%0/0%') {
        ret = NaN;
    }
    return ret;
}