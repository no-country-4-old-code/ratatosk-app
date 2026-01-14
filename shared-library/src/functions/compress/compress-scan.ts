import {CompressedScan, CompressedScans} from '../../datatypes/compress';
import {Scan} from '../../scan/interfaces';
import {lookupAssetFactory} from '../../asset/lookup-asset-factory';
import {createForEach} from '../general/for-each';

export function compressScans(scans: Scan[]): CompressedScans {
    const compressedV1 = scans.map(scan => compressScan(scan));
    const ids = scans.map(scan => `id${scan.id}`);
    const compressedV2 = createForEach(ids, (_, idx) => compressedV1[idx]);
    return compressedV2;
}

export function decompressScans(compressed: CompressedScans): Scan[] {
    let compressedV1: CompressedScan[];

    if (compressed.length === undefined) {
        // compression mode v2 detected -> convert to v1
        compressedV1 = Object.values(compressed);
    } else {
        compressedV1 = compressed as any as CompressedScan[];
    }

    return compressedV1.map(packed => decompressScan(packed));
}

// private

function compressScan(scan: Scan): CompressedScan {
    const asset = lookupAssetFactory[scan.asset];
    return {
        ...scan,
        result: asset.compressIds(scan.result),
        notification: {
            ...scan.notification,
            lastNotified: asset.compressIds(scan.notification.lastNotified),
            lastSeen: asset.compressIds(scan.notification.lastSeen),
        },
        preSelection: asset.compressPreSelection(scan.preSelection),
    } as CompressedScan;
}

function decompressScan(compressed: CompressedScan): Scan {
    const asset = lookupAssetFactory[compressed.asset];
    return {
        ...compressed,
        result: asset.decompressIds(compressed.result),
        notification: {
            ...compressed.notification,
            lastNotified: asset.decompressIds(compressed.notification.lastNotified),
            lastSeen: asset.decompressIds(compressed.notification.lastSeen),
        },
        preSelection: asset.decompressPreSelection(compressed.preSelection)
    };
}