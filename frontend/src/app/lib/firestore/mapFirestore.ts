import {lookupScanIcon, numberOfIcons} from '@app/lib/scan/lookup-icons';
import {ScanFrontend} from '@app/lib/scan/interfaces';
import {Scan} from '../../../../../shared-library/src/scan/interfaces';
import {Coin} from '@app/lib/coin/interfaces';
import {MetaData} from '../../../../../shared-library/src/datatypes/meta';
import {Storage} from '../../../../../shared-library/src/datatypes/data';

import {assetCoin} from '../../../../../shared-library/src/asset/lookup-asset-factory';
import {AssetType} from '@shared_library/asset/interfaces-asset';
import {getElementsWhichAreOnlyInFirstArray} from '@shared_library/functions/general/array';

export function mapStorage2Coins(coinSnapshotStorage: Storage<'coin', 'SNAPSHOT'>, meta: MetaData): Coin[] {
    return assetCoin.getIdsInStorage(coinSnapshotStorage).map(id => ({
        id: id,
        info: assetCoin.getInfo(id, meta, coinSnapshotStorage),
        snapshot: coinSnapshotStorage[id]
    }));
}

export function mapScan2Frontend(scan: Scan): ScanFrontend {
    return {
        ...scan,
        iconPath: lookupScanIcon[scan.iconId % numberOfIcons],
        numberOfNewAndUnseenAssets: getNumberOfAssetWhichAreNewInScan(scan)
    };
}

export function mapFrontend2Scan(scan: ScanFrontend | Scan): Scan {
    return {
        title: scan.title,
        id: scan.id,
        iconId: scan.iconId,
        asset: scan.asset,
        conditions: scan.conditions,
        preSelection: scan.preSelection,
        notification: scan.notification,
        result: scan.result,
        timestampResultData: scan.timestampResultData
    };
}

// private

function getNumberOfAssetWhichAreNewInScan<T extends AssetType>(scan: Scan): number {
    const added = getElementsWhichAreOnlyInFirstArray(scan.result, scan.notification.lastSeen);
    return added.length;
}