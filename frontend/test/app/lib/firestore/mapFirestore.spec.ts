import {
    createDummyScan,
    createDummyScanAlwaysFalse,
    createDummyScanAlwaysTrue
} from '@shared_library/functions/test-utils/dummy-data/scan';
import {assetCoin} from '@shared_library/asset/lookup-asset-factory';
import {mapFrontend2Scan, mapScan2Frontend} from '@lib/firestore/mapFirestore';
import {deepCopy} from '@shared_library/functions/general/object';

describe('Test mapping scan to scan frontend and via versa', function () {


    function act(result: any[], lastSeen: any[], expectedNumberOfUnseenAssets: number): void {
        const scan = createDummyScan(0);
        scan.result = result;
        scan.notification.lastSeen = lastSeen;
        const frontend = mapScan2Frontend(scan);
        expect(frontend.numberOfNewAndUnseenAssets).toEqual(expectedNumberOfUnseenAssets);
    }

    it('should set new of unseen assets', function () {
        act([], [], 0);
        act([], ['0'], 0);
        act(['0'], [], 1);
        act(['0'], ['0'], 0);
        act(['0', '1', '2'], ['0'], 2);
        act(['0', '1', '2'], ['0', '2'], 1);
        act(['0', '1', '2'], ['5', '4'], 3);
        act(['0', '1'], ['5', '4', '0'], 1);
    });

    it('should be reversible', function () {
        const scans = [
            createDummyScan(0),
            createDummyScanAlwaysTrue(),
            createDummyScanAlwaysFalse(),
            {...createDummyScan(0), result: assetCoin.getIds().slice(2)},
            {...createDummyScan(0), iconId: 3},
        ];
        scans.forEach(scan => {
            const frontend = mapScan2Frontend(deepCopy(scan));
            const reverted = mapFrontend2Scan(frontend);
            expect(scan).toEqual(reverted);
        });
    });

});