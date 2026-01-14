import {AssetType} from '../../asset/interfaces-asset';
import {AssetId} from '../../datatypes/data';
import {PreSelectionCoinParameter} from '../../asset/assets/coin/interfaces';
import {ForEach} from '../../datatypes/for-each';

export type PreSelectionParameterOption = string;
export type IsSelectedFunction<T> = (value: T) => boolean;
export type PreSelectionBlueprint<T extends AssetType> =
    { manual: AssetId<T>[] }
    & ForEach<PreSelectionAssetParam<T>, PreSelectionParameterOption[]>;

export type PreSelectionAssetParam<ASSET_TYPE extends AssetType> =
    ASSET_TYPE extends 'coin' ? PreSelectionCoinParameter :
        ASSET_TYPE extends any ? string :
            '';
