import {Currency} from '../datatypes/currency';

const currencyContainer: { [cur in Currency]: null } = {
    'usd': null,
    'aed': null,
    'aud': null,
    'bdt': null,
    'brl': null,
    'cad': null,
    'chf': null,
    'clp': null,
    'cny': null,
    'czk': null,
    'dkk': null,
    'eur': null,
    'gbp': null,
    'hkd': null,
    'idr': null,
    'ils': null,
    'inr': null,
    'jpy': null,
    'krw': null,
    'lkr': null,
    'mxn': null,
    'myr': null,
    'ngn': null,
    'nok': null,
    'nzd': null,
    'php': null,
    'pkr': null,
    'pln': null,
    'rub': null,
    'sek': null,
    'sgd': null,
    'thb': null,
    'try': null,
    'uah': null,
    'vnd': null,
    'zar': null,
};

export function getCurrencies(): Currency[] {
    return Object.keys(currencyContainer) as Currency[];
}
