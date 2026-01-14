import {Coin} from '@app/lib/coin/interfaces';
import {lookupCoinInfo} from '../../../../../shared-library/src/asset/assets/coin/helper/lookup-coin-info-basic';
import {createDummyMetaData} from '../../../../../shared-library/src/functions/test-utils/dummy-data/meta';
import {Meta} from '../../../../../shared-library/src/datatypes/meta';
import {AssetIdCoin} from '../../../../../shared-library/src/asset/assets/coin/interfaces';
import {History} from '../../../../../shared-library/src/datatypes/data';
import {AssetInfoExtended} from '@shared_library/asset/interfaces-asset';
import {assetCoin} from '../../../../../shared-library/src/asset/lookup-asset-factory';
import {getTestCategories} from '@shared_library/functions/test-utils/dummy-data/asset/category';
import {getTestCoinExchanges} from '@shared_library/functions/test-utils/dummy-data/asset/exchanges';


export function createCoinHistoryWithMetaData(seed: number): Meta<History<'coin'>> {
	const content = assetCoin.createDummyHistory(seed);
	const meta = createDummyMetaData();
	return {payload: content, meta};
}

export function createDummyCoin(id: AssetIdCoin, seed: number): Coin {
	return {
		id,
		info: {...createDummyCoinInfo(seed), ...lookupCoinInfo[id]},  // compatible to search terms
		snapshot: assetCoin.createDummySnapshot(seed)
	};
}

export function createDummyCoinInfo(seed: number): AssetInfoExtended<'coin'> {
	return {
		name: 'coin' + seed,
		symbol: 'SE' + seed,
		iconPath: 'assets/miau' + seed,
		priceInBitcoin: seed,
		maxSupply: seed,
		categories: getTestCategories(seed),
		exchanges: getTestCoinExchanges(seed),
		unit: 'usd'
	};
}
