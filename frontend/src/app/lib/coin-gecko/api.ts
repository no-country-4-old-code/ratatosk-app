import {AssetId} from '@shared_library/datatypes/data';
import {GeckoApiFrontend, ResponseGeckoCoinFrontend} from '@lib/coin-gecko/interfaces';

type Cache = {[id in AssetId<'coin'>]?: ResponseGeckoCoinFrontend};

export const geckoApi: GeckoApiFrontend = {
    fetch: getCoinInfos
};

// private

const cache: Cache = {};


function getCoinInfos(id: AssetId<'coin'>): Promise<ResponseGeckoCoinFrontend> {
    let promise: Promise<ResponseGeckoCoinFrontend>;
    if (cache[id] === undefined) {
        promise = fetchCoinInfos(id).then( resp => {
            cache[id] = resp;
            return resp;
        })
    } else {
        promise = new Promise((resolve) => resolve(cache[id]));
    }
    return promise;
}

function fetchCoinInfos(id: AssetId<'coin'>): Promise<ResponseGeckoCoinFrontend> {
    const url = `https://api.coingecko.com/api/v3/coins/${id}?localization=en&tickers=false&market_data=false&community_data=false&developer_data=false&sparkline=false`;
    return fetch(url)
        .then((response) => {
            return response.json();
        });
}

