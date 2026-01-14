import {Currency} from './currency';

export type ExchangeRates = {
    [unit in Currency]: number;
};

export interface MetaData {
    timestampMs: number;
    unit: Currency;
    ratesTo$: ExchangeRates;
}

export interface Meta<PAYLOAD> {
    meta: MetaData;
    payload: PAYLOAD;
}
