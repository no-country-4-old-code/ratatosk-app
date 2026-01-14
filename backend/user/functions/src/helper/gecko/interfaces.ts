// Requests

import {Currency} from '../../../../../../shared-library/src/datatypes/currency';

export interface RequestGeckoCoin {
    tickers: boolean;
    market_data: boolean;
    community_data: boolean;
    developer_data: boolean;
    localization: boolean;
    sparkline: boolean;
}

export interface RequestGeckoMarket {
    ids: string[];
    vs_currency: string;
    per_page?: number;
    page?: number;
}

export interface RequestGeckoMarketHistory {
    vs_currency: string;
    from: number;	// usd ms
    to: number;
}

// Response

export interface ResponseGeckoApi<T> {
    success: boolean;
    message: string;
    code: number;
    data: T | { error: string };
}

// Response data

export interface ResponseGeckoDataCoin {
    market_data: {
        current_price: LookupCurrencyToValue; // needed for exchange rates
    };
    community_data: {
        reddit_average_posts_48h: number;
        reddit_average_comments_48h: number;
    };
    developer_data: {
        stars: number;
        subscribers: number;
        commit_count_4_weeks: number;
    };
}

export type ResponseGeckoDataMarket = GeckoMarketDataSingleCurrency[];

export interface ResponseGeckoDataMarketHistory {
    prices: TimestampValueSample[];
    market_caps: TimestampValueSample[];
    total_volumes: TimestampValueSample[];
    errorResponse?: boolean;
}

// Response data sub types

export type LookupCurrencyToValue = { [unit in Currency]: number };

export type TimestampValueSample = [number, number];

interface GeckoInfoStats {
    name: string;
    id: string;
    symbol: string;
    market_cap_rank: number | null;
}

export interface GeckoMarketDataSingleCurrency extends GeckoInfoStats {
    current_price: number | null;
    total_volume: number | null;
    market_cap: number | null;
    circulating_supply: number | null;
    price_change_24h: number | null;
    price_change_percentage_24h: number | null;
    ath: number | null;
    ath_date: string | null;
    atl: number | null;
    atl_date: string | null;
}

