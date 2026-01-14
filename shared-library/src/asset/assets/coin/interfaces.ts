// identifier
import {ForEach} from '../../../datatypes/for-each';
import {AssetType} from '../../interfaces-asset';

export type AssetIdCoin = string;

// metrics
type MetricBasicNoCurrency = 'rank';  // attributes without currency are untouched by currency conversions
type MetricBasic = MetricBasicNoCurrency | 'price';
type MetricSnapshotNoCurrency = 'sparkline';
type MetricHistoryNoCurrency = 'supply' | 'redditScore' | 'rsi';

export type MetricCoinSnapshot = MetricBasic | MetricSnapshotNoCurrency | 'delta';
export type MetricCoinHistory = MetricBasic | MetricHistoryNoCurrency | 'volume' | 'marketCap';
export type MetricCoinOfNoCurrency = MetricBasicNoCurrency | MetricSnapshotNoCurrency | MetricHistoryNoCurrency;

// snapshot
export interface SnapshotCoin extends Omit<ForEach<MetricCoinSnapshot, number>, 'sparkline'> {
    sparkline: number[];
}

// preselection
export type PreSelectionCoinParameter = 'exchanges' | 'categories'


// asset descriptor
export interface AssetInfoAttributeCoin {
    readonly maxSupply: number;
    readonly categories: string[];
    readonly exchanges: string[];
}

export interface AssetInfoExtendedAttributeCoin extends AssetInfoAttributeCoin {
    priceInBitcoin: number;
}

// other
export interface ExchangeInfo<T extends AssetType> {
    name: string;
    image: string;
}