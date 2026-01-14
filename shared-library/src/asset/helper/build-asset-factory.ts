import {AssetType} from '../interfaces-asset';
import {AssetId, History, HistoryWithId, MetricHistory, Snapshot, Storage,} from '../../datatypes/data';
import {getKeysAs} from '../../functions/general/object';
import {createForEach} from '../../functions/general/for-each';
import {createEmptyTimeSteps} from '../../functions/time/steps';
import {lowestTimeRange} from '../../functions/time/get-time-ranges';
import {AssetFactory, AssetFactoryCore} from '../interfaces-factory';
import {PreSelectionBlueprint} from '../../scan/pre-selection/interfaces';

export function buildAssetFactory<ASSET_TYPE extends AssetType>(core: AssetFactoryCore<ASSET_TYPE>): AssetFactory<ASSET_TYPE> {
    return {
        ...core,
        getIdsInStorage: getIdsInStorage,
        getMetricsInHistory: getMetricsInHistory,
        // create
        createNaNSnapshot: () => core.createDummySnapshot(NaN),
        createEmptyHistory: () => createEmptyHistory<ASSET_TYPE>(core.getMetricsHistory()),
        createDefaultPreSelection: () => createDefaultPreSelection(core),
        // test
        createDummyPartialFilledHistoryWithId,
        createDummyStorageSnapshot: (ids: AssetId<ASSET_TYPE>[], initFirstValue = 0) => {
            return createForEach<AssetId<ASSET_TYPE>, Snapshot<ASSET_TYPE>>(ids, (attr, idx) => core.createDummySnapshot(idx + initFirstValue));
        },
    };
}

function getIdsInStorage<ASSET_TYPE extends AssetType>(storage: Storage<ASSET_TYPE, any>): AssetId<ASSET_TYPE>[] {
    return getKeysAs<AssetId<ASSET_TYPE>>(storage);
}

function getMetricsInHistory<ASSET_TYPE extends AssetType>(history: History<ASSET_TYPE>): MetricHistory<ASSET_TYPE>[] {
    return getKeysAs<MetricHistory<ASSET_TYPE>>(history);
}

function createEmptyHistory<ASSET_TYPE extends AssetType>(metrics: MetricHistory<ASSET_TYPE>[]): History<ASSET_TYPE> {
    return createForEach(metrics, () => createEmptyTimeSteps());
}

function createDefaultPreSelection<ASSET_TYPE extends AssetType>(core: AssetFactoryCore<ASSET_TYPE>): PreSelectionBlueprint<ASSET_TYPE> {
    const additionalParams = core.getPreSelectionAssetParams();
    const onlyAdditional = createForEach(additionalParams, (param) => core.getPreSelectionHelper(param).getDefaultOptions());
    const basic: PreSelectionBlueprint<any> = {manual: core.getIds()};
    return {...basic, ...onlyAdditional} as PreSelectionBlueprint<ASSET_TYPE>;
}

// test dummys

function createDummyPartialFilledHistoryWithId<T extends AssetType>(id: AssetId<T>, metric: MetricHistory<T>, values: number[]): HistoryWithId<T> {
    const history = createEmptyHistory([metric]);
    history[metric][lowestTimeRange] = values;
    return {id, history};
}


