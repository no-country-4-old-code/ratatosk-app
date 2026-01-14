import {
    MetricCoinHistory,
    MetricCoinOfNoCurrency
} from '../../../../../../shared-library/src/asset/assets/coin/interfaces';
import {Currency} from '../../../../../../shared-library/src/datatypes/currency';

const lookupNonCurrencyAttributeToUnit: { [attr in MetricCoinOfNoCurrency]: string } = {
    rank: '#',
    supply: '#',
    redditScore: '#',
    rsi: '#',
    sparkline: '#',
};

export function getUnitSymbolOfAttribute(currency: Currency, attribute: MetricCoinHistory): string {
    if (attribute in lookupNonCurrencyAttributeToUnit) {
        return lookupNonCurrencyAttributeToUnit[attribute];
    } else {
        return lookupCurrencySymbol[currency];
    }
}

export function getAttributesWhichHaveNoCurrency(): MetricCoinOfNoCurrency[] {
    return Object.keys(lookupNonCurrencyAttributeToUnit) as MetricCoinOfNoCurrency[];
}

// https://transferwise.com/gb/blog/world-currency-symbols
export const lookupCurrencySymbol: { [unit in Currency]: string } = {
    'usd': '$',
    'aed': 'د.إ',
    'aud': '$',
    'bdt': '৳',
    'brl': 'R$',
    'cad': '$',
    'chf': 'CHF',
    'clp': '¥',
    'cny': '$',
    'czk': 'Kč',
    'dkk': 'kr',
    'eur': '€',
    'gbp': '£',
    'hkd': '$',
    'idr': 'Rp',
    'ils': '₪',
    'inr': '₹',
    'jpy': '¥',
    'krw': '₩',
    'lkr': 'Rs',
    'mxn': '$',
    'myr': 'RM',
    'ngn': '₦',
    'nok': 'kr',
    'nzd': '$',
    'php': '₱',
    'pkr': 'Rs',
    'pln': 'zł',
    'rub': '₽',
    'sek': 'kr',
    'sgd': '$',
    'thb': '฿',
    'try': '₺',
    'uah': '₴',
    'vnd': '₫',
    'zar': 'R',
};

