import {AssetType} from '../../../src/asset/interfaces-asset';
import {Scan} from '../../../src/scan/interfaces';
import {createDummyScan} from '../../../src/functions/test-utils/dummy-data/scan';
import {lookupAssetFactory} from '../../../src/asset/lookup-asset-factory';
import {deepCopy} from '../../../src/functions/general/object';
import {compressScans, decompressScans} from '../../../src/functions/compress/compress-scan';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const sizeof = require('firestore-size');

describe('Test compression of scans', function () {

    describe('Test compression of id', function () {
        const assets: AssetType[] = ['coin', 'coin', 'coin'];
        let scans: Scan[];

        beforeEach(function () {
            scans = assets.map(asset => createDummyScan(1, asset));
            scans.forEach((scan, idx) => {
                const ids = lookupAssetFactory[scan.asset].getIds().slice(idx);
                scan.id = idx;
                scan.preSelection.manual = ids;
                scan.notification.lastNotified = ids;
                scan.notification.lastSeen = ids;
                scan.result = ids;
            });
        });

        it('should be reversible ', function () {
            const copy = deepCopy(scans);
            const compressed = compressScans(scans);
            const result = decompressScans(compressed);
            expect(result).toEqual(copy);
            expect(scans.length).toEqual(3);
        });

        it('should work with empty scans', function () {
            scans = [];
            const copy = deepCopy(scans);
            const compressed = compressScans(scans);
            const result = decompressScans(compressed);
            expect(result).toEqual(copy);
            expect(scans.length).toEqual(0);
        });

        it('should work with one scan', function () {
            scans = [scans[1]];
            const copy = deepCopy(scans);
            const compressed = compressScans(scans);
            const result = decompressScans(compressed);
            expect(result).toEqual(copy);
            expect(scans.length).toEqual(1);
        });

        it('should compress scan in obj format (instead of a list) in a way that a update via a.b.c is possible', function () {
            /* The whole point of the compression mode v2 is that we can use firebase "update" to "update" the result
                of a scan without writing the other unchanged data. Then we only have the 1ß.000 writes / sec. cap.
             */
            const compressed = compressScans(scans);
            expect(compressed.id0.result).toBeDefined();
            expect(compressed.id1.result).toBeDefined();
            expect(compressed.id2.result).toBeDefined();
        });

        it('should be smaller', function () {
            // 2021-04-30: Size of ids before: 257 Bytes and after 80 Bytes. Reduced by 177 Bytes
            // 2021-05-04: Size of ids before: 257 Bytes and after 41 Bytes. Reduced by 216 Bytes (char bitmap)
            const compressed = compressScans(scans);
            const sizeFull = sizeof(scans);
            const sizeCompressed = sizeof(compressed);
            console.log(`Size of ids before: ${sizeFull} Bytes and after ${sizeCompressed} Bytes. Reduced by ${sizeFull - sizeCompressed} Bytes`);
            expect(sizeCompressed).toBeLessThan(sizeFull);
        });
    });
});