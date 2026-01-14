import {deepCopy} from '../../../src/functions/general/object';
import {UserData} from '../../../src/datatypes/user';
import {createDummyUserData} from '../../../src/functions/test-utils/dummy-data/user';
import {compressUser, decompressUser} from '../../../src/functions/compress/compress-user';
import {CompressedUserData} from '../../../src/datatypes/compress';
import {assetCoin} from '../../../src/asset/lookup-asset-factory';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const sizeof = require('firestore-size');

describe('Test non-asset-specific compression and decompression', function () {

    describe('Test user data', function () {
        let user: UserData;

        beforeEach(function () {
            user = createDummyUserData(3);
            user.scans = user.scans.map((scan, idx) => {
                return {
                    title: `FilledScan ${idx}`,
                    id: idx,
                    iconId: idx,
                    asset: 'coin',
                    conditions: scan.conditions,
                    preSelection: {...scan.preSelection, manual: assetCoin.getIds().slice(0, 1)},
                    notification: {
                        lastNotified: assetCoin.getIds().slice(0, idx),
                        lastSeen: assetCoin.getIds().slice(0, idx + 1),
                        isEnabled: idx % 2 === 0
                    },
                    result: assetCoin.getIds().slice(idx),
                    timestampResultData: idx
                };
            });
        });

        it('should be reversible ', function () {
            const copy = deepCopy(user);
            const compressed = compressUser(user) as CompressedUserData;
            const result = decompressUser(compressed);
            expect(result).toEqual(copy);
        });

        it('should be reversible (with optional feedback parameter)', function () {
            user.feedback = 1234.567;
            const copy = deepCopy(user);
            const compressed = compressUser(user) as CompressedUserData;
            const result = decompressUser(compressed);
            expect(result).toEqual(copy);
        });

        it('should work with partial user (only scans)', function () {
            const partial: Partial<UserData> = {scans: user.scans};
            const copy = deepCopy(user);
            const compressed = compressUser(partial);
            const result = decompressUser({...user, ...compressed} as CompressedUserData);
            expect(result).toEqual(copy);
        });

        it('should not throw error if try to compress empty user', function () {
            const compressed = compressUser({});
            expect(compressed).toEqual({});
        });

        it('should be smaller', function () {
            // 2021-04-30 : Size of user before: 1364 Bytes and after 1132 Bytes. Reduced by 232 Bytes
            // 2021-05-04 : Size of user before: 1364 Bytes and after 1092 Bytes. Reduced by 272 Bytes (char bitmap)
            const compressed = compressUser(user);
            const sizeFull = sizeof(user);
            const sizeCompressed = sizeof(compressed);
            console.log(`Size of user before: ${sizeFull} Bytes and after ${sizeCompressed} Bytes. Reduced by ${sizeFull - sizeCompressed} Bytes`);
            expect(sizeCompressed).toBeLessThan(sizeFull);
        });
    });
});
