import {lookupCoinInfo} from './lookup-coin-info-basic';
import {MetaData} from '../../../../datatypes/meta';
import {AssetId, Storage} from '../../../../datatypes/data';
import {getKeysAs} from '../../../../functions/general/object';
import {AssetIdCoin} from '../interfaces';
import {AssetInfoExtended} from '../../../interfaces-asset';

export function getCoinIds(): AssetId<'coin'>[] {
    return getKeysAs<AssetIdCoin>(lookupCoinInfo);
}

export function getCoinInfo(id: AssetId<'coin'>, meta: MetaData, storageCoin: Storage<'coin', 'SNAPSHOT'>): AssetInfoExtended<'coin'> {
    const idBitcoin: AssetId<'coin'> = 'bitcoin';
    const basic = lookupCoinInfo[id];
    return {
        name: basic.name,
        symbol: basic.symbol,
        iconPath: basic.iconPath,
        maxSupply: basic.maxSupply,
        categories: basic.categories,
        exchanges: basic.exchanges,
        unit: meta.unit,
        priceInBitcoin: storageCoin[idBitcoin].price / storageCoin[id].price
    };
}
