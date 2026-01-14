import {AssetId, History, HistoryWithId, MetricHistory, MetricSnapshot, Snapshot, Storage} from '../datatypes/data';
import {MetaData} from '../datatypes/meta';
import {
    CompressedAssetIds,
    CompressedHistory,
    CompressedPreSelectionBlueprint,
    CompressedStorageSnapshot
} from '../datatypes/compress';
import {AssetInfoExtended, AssetType} from './interfaces-asset';
import {PreSelectionParamHelper} from './interfaces-preselection';
import {PreSelectionAssetParam, PreSelectionBlueprint} from '../scan/pre-selection/interfaces';

export interface AssetFactoryCore<ASSET_TYPE extends AssetType> {
    getIds: () => AssetId<ASSET_TYPE>[];
    // metrics
    getMetricsSnapshot: () => MetricSnapshot<ASSET_TYPE>[];
    getMetricsHistory: () => MetricHistory<ASSET_TYPE>[];
    // pre selection params
    getPreSelectionAssetParams: () => PreSelectionAssetParam<ASSET_TYPE>[];
    // info
    getInfo: (id: AssetId<ASSET_TYPE>, meta: MetaData, storage: Storage<ASSET_TYPE, 'SNAPSHOT'>) => AssetInfoExtended<ASSET_TYPE>;
    lookupMetric2Name: {[metric in MetricHistory<ASSET_TYPE>]: string};
    // compress
    compressIds: (ids: AssetId<ASSET_TYPE>[]) => CompressedAssetIds;
    decompressIds: (ids: CompressedAssetIds) => AssetId<ASSET_TYPE>[];
    compressStorageSnapshot: (snapshot: Storage<'coin', 'SNAPSHOT'>) => CompressedStorageSnapshot;
    decompressStorageSnapshot: (compressed: CompressedStorageSnapshot) => Storage<'coin', 'SNAPSHOT'>;
    compressHistory: (history: History<'coin'>) => CompressedHistory;
    decompressHistory: (compressed: CompressedHistory) => History<'coin'>;
    compressPreSelection: (blueprint: PreSelectionBlueprint<'coin'>) => CompressedPreSelectionBlueprint;
    decompressPreSelection: (compressed: CompressedPreSelectionBlueprint) => PreSelectionBlueprint<'coin'>;
    // default
    getPreSelectionHelper: (param: PreSelectionAssetParam<ASSET_TYPE>) => PreSelectionParamHelper<ASSET_TYPE>;
    // test
    createDummySnapshot: (seed: number) => Snapshot<ASSET_TYPE>;
    createDummyHistory: (seed: number) => History<ASSET_TYPE>;
}

export interface AssetFactory<ASSET_TYPE extends AssetType> extends AssetFactoryCore<ASSET_TYPE> {
    getIdsInStorage: (storage: Storage<ASSET_TYPE, any>) => AssetId<ASSET_TYPE>[];
    // metrics
    getMetricsInHistory: (history: History<ASSET_TYPE>) => MetricHistory<ASSET_TYPE>[];
    // create
    createNaNSnapshot: () => Snapshot<ASSET_TYPE>;
    createEmptyHistory: () => History<ASSET_TYPE>;
    createDefaultPreSelection: () => PreSelectionBlueprint<ASSET_TYPE>;
    // test
    createDummyStorageSnapshot: (ids: AssetId<ASSET_TYPE>[], initFirstValue: number) => Storage<ASSET_TYPE, 'SNAPSHOT'>;
    createDummyPartialFilledHistoryWithId: (id: AssetId<ASSET_TYPE>, metric: MetricHistory<ASSET_TYPE>, values: number[]) => HistoryWithId<ASSET_TYPE>;
}