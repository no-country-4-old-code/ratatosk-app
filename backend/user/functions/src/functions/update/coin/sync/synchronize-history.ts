import {synchronizeBufferWithCoinIds} from './synchronize-buffer';
import {CoinHistoryStorage} from '../../../../helper/interfaces';

export function synchronizeHistoryWithCoinIds(history: CoinHistoryStorage): CoinHistoryStorage {
    return synchronizeBufferWithCoinIds(history, history);
}
