import {AssetId,} from '../datatypes/data';
import {Currency} from '../datatypes/currency';
import {AssetInfoAttributeCoin, AssetInfoExtendedAttributeCoin} from './assets/coin/interfaces';
import {ForEach} from '../datatypes/for-each';

export type AssetType = 'coin';

// asset info

type LookupTypeAssetInfo<ASSET_TYPE extends AssetType> =
    ASSET_TYPE extends 'coin' ? AssetInfoAttributeCoin :
        '';
type LookupTypeAssetInfoExtended<ASSET_TYPE extends AssetType> =
    ASSET_TYPE extends 'coin' ? AssetInfoExtendedAttributeCoin :
        '';

interface AssetInfoBasic {
    readonly name: string;
    readonly symbol: string;
    readonly iconPath: string;
}

export type AssetInfo<ASSET_TYPE extends AssetType> = AssetInfoBasic & LookupTypeAssetInfo<ASSET_TYPE>;
export type AssetInfoExtended<ASSET_TYPE extends AssetType> =
    { readonly unit: Currency }
    & LookupTypeAssetInfoExtended<ASSET_TYPE>
    & AssetInfo<ASSET_TYPE>;

export type LookupAssetInfo<ASSET_TYPE extends AssetType> = ForEach<AssetId<ASSET_TYPE>, AssetInfo<ASSET_TYPE>>;

