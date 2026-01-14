import {getMetricsCoinHistory, getMetricsCoinSnapshot} from './helper/get-metrics';
import {getCoinIds, getCoinInfo} from './helper/get-ids-and-info';
import {
    compressCoinHistory,
    compressCoinIds,
    compressCoinPreSelection,
    compressCoinStorageSnapshot,
    decompressCoinHistory,
    decompressCoinIds,
    decompressCoinPreSelection,
    decompressCoinStorageSnapshot
} from './helper/compress';
import {createDummyCoinHistory, createDummyCoinSnapshot} from './helper/dummy';
import {getPreSelectionAssetParamsCoin, getPreSelectionParamHelperCoin} from './helper/preselection';
import {AssetFactoryCore} from '../../interfaces-factory';
import {lookupMetricNameCoin} from './helper/lookup-metric-name';

export const AssetFactoryCoreCoin: AssetFactoryCore<'coin'> = {
    getIds: getCoinIds,
    // metrics
    getMetricsSnapshot: getMetricsCoinSnapshot,
    getMetricsHistory: getMetricsCoinHistory,
    // preselection
    getPreSelectionAssetParams: getPreSelectionAssetParamsCoin,
    // info
    getInfo: getCoinInfo,
    lookupMetric2Name: lookupMetricNameCoin,
    // compress
    compressIds: compressCoinIds,
    decompressIds: decompressCoinIds,
    compressStorageSnapshot: compressCoinStorageSnapshot,
    decompressStorageSnapshot: decompressCoinStorageSnapshot,
    compressHistory: compressCoinHistory,
    decompressHistory: decompressCoinHistory,
    compressPreSelection: compressCoinPreSelection,
    decompressPreSelection: decompressCoinPreSelection,
    // pre selection
    getPreSelectionHelper: getPreSelectionParamHelperCoin,
    // test
    createDummySnapshot: createDummyCoinSnapshot,
    createDummyHistory: createDummyCoinHistory
};