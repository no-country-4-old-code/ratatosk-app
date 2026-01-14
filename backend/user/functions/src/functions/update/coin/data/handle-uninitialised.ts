import {sampleGeckoHistory} from './sample-coin-history';
import {CoinHistoryStorage} from '../../../../helper/interfaces';
import {assetCoin} from '../../../../../../../../shared-library/src/asset/lookup-asset-factory';
import {AssetIdCoin} from '../../../../../../../../shared-library/src/asset/assets/coin/interfaces';
import {fixMalformedSampledHistory, isSampledHistoryMalformed} from './fix-malformed-sampled-history';
import {History} from '../../../../../../../../shared-library/src/datatypes/data';


export function handleUninitialisedAssets(history: CoinHistoryStorage): Promise<CoinHistoryStorage> {
    const uninitialisedIds = getIdsUninitialised(history);
    let promise = new Promise<CoinHistoryStorage>((resolve) => resolve(history));
    if (uninitialisedIds.length > 0) {
        console.warn('Uninitialised coin ids detected', uninitialisedIds);
        const id = uninitialisedIds[0];
        promise = sampleGeckoHistory(id).then(content => {
            const validContent = fixIfMalformed(content);
            return {...history, [id]: validContent};
        }).catch(error => {
            console.warn(`Error during sampling new coin ${id} occured`, error.message);
            return {...history};
        });
    }
    return promise;
}

// private

function getIdsUninitialised(history: CoinHistoryStorage): AssetIdCoin[] {
    const initialisedCoinIds = assetCoin.getIdsInStorage(history);
    return assetCoin.getIds().filter(id => !initialisedCoinIds.includes(id));
}

function fixIfMalformed(history: History<'coin'>): History<'coin'> {
    if (isSampledHistoryMalformed(history)) {
        history = fixMalformedSampledHistory(history);
    }
    return history;
}