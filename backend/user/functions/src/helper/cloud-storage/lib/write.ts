import {cloudStorageApi} from './api';
import path from 'path';
import os from 'os';
import {FileApi} from '../../file/api';

export async function writeCloudStorage(cloudStoragePath: string, data: any): Promise<void> {
    const tempFileName = mapPathToFileName(cloudStoragePath);
    const tempLocalFile = path.join(os.tmpdir(), tempFileName);
    const bucket = cloudStorageApi.getBucket();
    const dataJson = JSON.stringify(data, mapNaN2String);

    return new Promise((resolve) => resolve()).then(() => {
        return FileApi.writeFile(tempLocalFile, dataJson).then(() => {
            return bucket.upload(tempLocalFile, {destination: cloudStoragePath}).then(() => {
                return FileApi.deleteFile(tempLocalFile);
            });
        });
    });
}

// private

function mapPathToFileName(path: string): string {
    return path.split('/').join('_').split('\\').join('_') + '.write';
}

function mapNaN2String(key: string, value: any): string {
    if (value !== value) {
        value = '%0/0%';
    }
    return value;
}
