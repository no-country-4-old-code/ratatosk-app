import {AssetType} from './interfaces-asset';
import {AssetFactoryCoreCoin} from './assets/coin/core';
import {buildAssetFactory} from './helper/build-asset-factory';
import {AssetFactory} from './interfaces-factory';

type LookupAssetFactory = { [ASSET_TYPE in AssetType]: AssetFactory<ASSET_TYPE> };

export const lookupAssetFactory: LookupAssetFactory = {
    'coin': buildAssetFactory(AssetFactoryCoreCoin)
};

// TODO: Re-Substitue assetCoin
export const assetCoin = lookupAssetFactory['coin'];
