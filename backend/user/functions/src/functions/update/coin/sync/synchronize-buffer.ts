import {getIdsInitialised} from '../../../../helper/get-initialised-coin-ids';
import {CoinHistoryStorage} from '../../../../helper/interfaces';
import {assetCoin} from '../../../../../../../../shared-library/src/asset/lookup-asset-factory';
import {AssetIdCoin} from '../../../../../../../../shared-library/src/asset/assets/coin/interfaces';
import {History} from '../../../../../../../../shared-library/src/datatypes/data';
import {TimeSteps} from '../../../../../../../../shared-library/src/datatypes/time';
import {createEmptyTimeSteps} from '../../../../../../../../shared-library/src/functions/time/steps';


export function synchronizeBufferWithCoinIds(buffer: CoinHistoryStorage, history: CoinHistoryStorage): CoinHistoryStorage {
    const syncBuffer: any = {};
    const ids = getIdsInitialised(history);
    const attributes = assetCoin.getMetricsHistory();

    ids.forEach((id: AssetIdCoin) => {
        syncBuffer[id] = mapUndefined2Empty(buffer[id]);
        attributes.forEach(attr => {
            syncBuffer[id][attr] = mapUndefined2Steps(syncBuffer[id][attr]);
        });
    });
    return syncBuffer;
}

// private

function mapUndefined2Empty(obj: History<'coin'>): History<'coin'> {
    if (obj === undefined) {
        return {} as History<'coin'>;
    } else {
        return {...obj};
    }
}

function mapUndefined2Steps(obj: TimeSteps): TimeSteps {
    if (obj === undefined) {
        return createEmptyTimeSteps();
    } else {
        return {...obj};
    }
}
