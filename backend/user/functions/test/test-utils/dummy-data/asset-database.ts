import {AssetDatabase} from '../../../src/functions/scan/helper/interfaces';
import {createDummyMetaData} from '../../../../../../shared-library/src/functions/test-utils/dummy-data/meta';
import {lookupAssetFactory} from '../../../../../../shared-library/src/asset/lookup-asset-factory';
import {AssetType} from '../../../../../../shared-library/src/asset/interfaces-asset';
import {HistoryWithId} from '../../../../../../shared-library/src/datatypes/data';
import {createForEach} from '../../../../../../shared-library/src/functions/general/for-each';
import {getAssets} from '../../../../../../shared-library/src/asset/helper/get-assets';
import {Meta} from '../../../../../../shared-library/src/datatypes/meta';
import {AssetFactory} from '../../../../../../shared-library/src/asset/interfaces-factory';

export function createDummyAssetDatabase(seed: number): AssetDatabase {
    const assets = getAssets();
    return createForEach(assets, assetType => createDummyDatabaseForSingleAsset(assetType, seed));
}

// private

function createDummyDatabaseForSingleAsset(assetType: AssetType, seed: number): Meta<HistoryWithId<any>[]> {
    return {meta: createDummyMetaData(), payload: createPayload(assetType, seed)};
}

function createPayload<T extends AssetType>(assetType: AssetType, seed: number): HistoryWithId<T>[] {
    const asset = lookupAssetFactory[assetType] as AssetFactory<T>;
    const ids = asset.getIds();
    return ids.map((id, idx) => ({id, history: asset.createDummyHistory(idx + seed)}));
}