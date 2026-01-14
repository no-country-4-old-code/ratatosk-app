// https://www.coingecko.com/api/documentations/v3#/coins/get_coins_list
// infos at https://github.com/miscavage/CoinGecko-API

export const geckoRequestSettings = {
    // make we do not exceed the 10 requests / sec limit (! there is also a 100 requests / minute limit)
    // coin gecko is a little bit thottleing sometimes
    getSleepTimeMs: () => 525 // with puffer because sometimes multiple calls like fetchCoin and fetchCoinMarketRange occur parallel
};
