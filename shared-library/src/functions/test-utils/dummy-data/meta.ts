import {MetaData} from '../../../datatypes/meta';
import {getDummyExchangeRates} from './currency';

export function createDummyMetaData(timestampMs = 100000): MetaData {
    return {unit: 'usd', timestampMs, ratesTo$: getDummyExchangeRates()};
}
