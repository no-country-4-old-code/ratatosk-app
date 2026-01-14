import {
    AssetIdCoin,
    MetricCoinHistory,
    SnapshotCoin
} from '../../../../../../../../shared-library/src/asset/assets/coin/interfaces';
import {MetaData} from '../../../../../../../../shared-library/src/datatypes/meta';
import {CoinHistoryStorage} from '../../../../helper/interfaces';


export type CoinSample = { [attribute in MetricCoinHistory]: number } & SnapshotCoin;
export type CoinSamples = { [id in AssetIdCoin]: CoinSample };

export interface UpdateDbData {
    samples: CoinSamples;
    history: CoinHistoryStorage;
    buffer: CoinHistoryStorage;
    meta: MetaData;
}