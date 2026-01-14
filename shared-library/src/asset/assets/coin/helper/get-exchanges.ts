import {getKeysAs} from '../../../../functions/general/object';
import {lookupCoinExchangeInfo} from './lookup-exchange-info';

export function getCoinExchanges(): string[] {
    return getKeysAs<string>(lookupCoinExchangeInfo);
}