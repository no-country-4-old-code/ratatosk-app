import {DownloadResponse} from '@google-cloud/storage/build/src/file';
import {UploadResponse} from '@google-cloud/storage/build/src/bucket';
import {FileApi} from '../../../../src/helper/file/api';

interface DownloadUploadOptions {
    destination: string;
}

interface File {
    download: (options: DownloadUploadOptions) => Promise<DownloadResponse>;
}

export class CloudStorageBucketMock {
    storage: any = {};

    file(cloudStoragePath: string): File {
        return {
            download: (options: DownloadUploadOptions) => this.downloadFile(cloudStoragePath, options)
        };
    }

    upload(tempLocalFile: string, options: DownloadUploadOptions): Promise<UploadResponse> {
        return this.copyLocalToCloud(tempLocalFile, options.destination);
    }

    // private

    private downloadFile(cloudStoragePath: string, options: DownloadUploadOptions): Promise<DownloadResponse> {
        return this.copyCloudToLocal(cloudStoragePath, options.destination);
    }

    private copyLocalToCloud(srcLocalPath: string, destCloudPath: string): Promise<any> {
        return FileApi.readFile(srcLocalPath).then((buf: any) => {
            this.storage[destCloudPath] = buf;
        });
    }

    private copyCloudToLocal(srcCloudPath: string, destLocalPath: string): Promise<DownloadResponse> {
        const buf = this.storage[srcCloudPath];
        if (buf === undefined) {
            const files = Object.keys(this.storage);
            throw new Error(`Cloud Storage Mock: Try to read not existing file ${srcCloudPath} in ${files}`);
        }
        return FileApi.writeFile(destLocalPath, buf).then(() =>
            [Buffer.from('')]);
    }
}
