import {PreSelectionAssetParam} from '../../../../scan/pre-selection/interfaces';
import {getCoinCategories} from './get-categories';
import {lookupCoinInfo} from './lookup-coin-info-basic';
import {AssetType} from '../../../interfaces-asset';
import {PreSelectionParamHelper} from '../../../interfaces-preselection';
import {getKeysAs} from '../../../../functions/general/object';
import {getCoinExchanges} from './get-exchanges';
import {lookupCoinExchangeInfo} from './lookup-exchange-info';

type LookupPreSelectionHelper<T extends AssetType> = { [param in PreSelectionAssetParam<T>]: PreSelectionParamHelper<T> }

const lookupParamHelper: LookupPreSelectionHelper<'coin'> = {
    exchanges: {
        getOptions: getCoinExchanges,
        getDefaultOptions: getCoinExchanges,
        mapId2Options: id => lookupCoinInfo[id].exchanges,
        getIconPath: (exchangeId) => lookupCoinExchangeInfo[exchangeId].image,
        getTitle: (exchangeId) => lookupCoinExchangeInfo[exchangeId].name
    },
    categories: {
        getOptions: getCoinCategories,
        getDefaultOptions: getCoinCategories,
        mapId2Options: id => lookupCoinInfo[id].categories,
        getIconPath: () => '',
        getTitle: (id) => id
    }
};

export function getPreSelectionParamHelperCoin(param: PreSelectionAssetParam<'coin'>): PreSelectionParamHelper<'coin'> {
    return lookupParamHelper[param];
}

export function getPreSelectionAssetParamsCoin(): PreSelectionAssetParam<'coin'>[] {
    return getKeysAs<PreSelectionAssetParam<'coin'>>(lookupParamHelper);
}
