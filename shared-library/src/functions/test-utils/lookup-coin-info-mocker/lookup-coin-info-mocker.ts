import {deepCopy} from '../../general/object';
import {createRangeArray} from '../../general/array';
import {lookupCoinInfo} from '../../../asset/assets/coin/helper/lookup-coin-info-basic';
import {AssetInfo, LookupAssetInfo} from '../../../asset/interfaces-asset';
import {getTestCategories} from '../dummy-data/asset/category';
import {getTestCoinExchanges} from '../dummy-data/asset/exchanges';

export const backupMockLookupCoinInfo: LookupAssetInfo<'coin'> = deepCopy(lookupCoinInfo);
const lookupCoinInfoMocked = createFakeLookupCoinInfo(54);


export function setUpLookupCoinInfoMock(newLookup: LookupAssetInfo<'coin'> = lookupCoinInfoMocked): void {
    deleteAllAttributes();
    addAttributesOfMocked(newLookup);
}

export function createFakeLookupCoinInfo(numberOfCoins: number): LookupAssetInfo<'coin'> {
    const fake: any = {};
    createRangeArray(numberOfCoins).forEach(i => {
        fake[`id${i}`] = createInfo(`C${i}`, `S${i}`, `${i}.png`, i, getTestCategories(i), getTestCoinExchanges(i));
    });
    return fake;
}

// private

function deleteAllAttributes(): void {
    const keysToDelete: string[] = Object.keys(lookupCoinInfo);
    keysToDelete.forEach(key => delete lookupCoinInfo[key]);
}

function addAttributesOfMocked(newLookup: LookupAssetInfo<'coin'>): void {
    const keysToAdd: string[] = Object.keys(newLookup);
    keysToAdd.forEach(key => {
        lookupCoinInfo[key] = newLookup[key];
    });
}

function createInfo(name: string, symbol: string, iconPath: string, maxSupply: number, categories: string[], exchanges: string[]): AssetInfo<'coin'> {
    const path = 'assets/icons/coins/';
    return {name, symbol, iconPath: path + iconPath, maxSupply, categories, exchanges};
}
