import {Meta} from './meta';
import {TimeSteps} from './time';
import {
    AssetIdCoin,
    MetricCoinHistory,
    MetricCoinOfNoCurrency,
    MetricCoinSnapshot,
    SnapshotCoin
} from '../asset/assets/coin/interfaces';
import {AssetType} from '../asset/interfaces-asset';
import {ForEach} from './for-each';
import {CompressedHistory, CompressedStorageSnapshot} from './compress';

export type MetricNoCurrency<ASSET_TYPE extends AssetType> =
    ASSET_TYPE extends 'coin' ? MetricCoinOfNoCurrency :
        ASSET_TYPE extends any ? any :
            '';

export type MetricHistory<ASSET_TYPE extends AssetType> =
    ASSET_TYPE extends 'coin' ? MetricCoinHistory :
        ASSET_TYPE extends any ? any :
            '';


export type MetricSnapshot<ASSET_TYPE extends AssetType> =
    ASSET_TYPE extends 'coin' ? MetricCoinSnapshot :
        ASSET_TYPE extends any ? any :
            '';


export type AssetId<ASSET_TYPE extends AssetType> =
    ASSET_TYPE extends 'coin' ? AssetIdCoin :
        ASSET_TYPE extends any ? string :
            '';


// Contain snapshot info for every asset of asset type
export type Snapshot<ASSET_TYPE extends AssetType> =
    ASSET_TYPE extends 'coin' ? SnapshotCoin :
        ASSET_TYPE extends any ? any :
            '';

// Contain historic information of one asset for each attribute for all ranges
export type History<ASSET_TYPE extends AssetType> = ForEach<MetricHistory<ASSET_TYPE>, TimeSteps>;
export type HistoryWithId<ASSET_TYPE extends AssetType> = { id: AssetId<ASSET_TYPE>; history: History<ASSET_TYPE> };

export type StorageContent = 'HISTORY' | 'SNAPSHOT'
export type BucketContent = StorageContent | 'COMPRESSED_SNAPSHOT' | 'COMPRESSED_SINGLE_HISTORY';

export type LookupTypeStorageContent<ASSET_TYPE extends AssetType, CONTENT extends StorageContent> =
    CONTENT extends 'HISTORY' ? History<ASSET_TYPE> :
        CONTENT extends 'SNAPSHOT' ? Snapshot<ASSET_TYPE> :
            CONTENT extends any ? History<ASSET_TYPE> | Snapshot<ASSET_TYPE> :
                '';

// Contain history or snapshot info for every asset of asset type
export type Storage<ASSET_TYPE extends AssetType, CONTENT extends StorageContent> =
    ForEach<AssetId<ASSET_TYPE>,
        LookupTypeStorageContent<ASSET_TYPE, CONTENT>>;

// Saved in cloud
export type LookupTypeBucketContent<ASSET_TYPE extends AssetType, CONTENT extends BucketContent> =
    CONTENT extends 'COMPRESSED_SNAPSHOT' ? CompressedStorageSnapshot :
        CONTENT extends 'COMPRESSED_SINGLE_HISTORY' ? CompressedHistory :
            CONTENT extends StorageContent ? Storage<ASSET_TYPE, CONTENT> :
                CONTENT extends any ? CompressedStorageSnapshot | Storage<ASSET_TYPE, any> :
                    '';

export type Bucket<ASSET_TYPE extends AssetType, CONTENT extends BucketContent> =
    Meta<LookupTypeBucketContent<ASSET_TYPE, CONTENT>>


