// TODO: refactor attribute names
// --> capacity zu market_cap, delta -> etc..

// TODO: write coin gecko because of logo (important)

// TODO: add two other coin sources (besides coin gecko) + write coin gecko not at first place
//  -> goal is not to show that we store data from coin gecko !

// TODO: Change Structure to Fire-Storage with Attribute divided
// --> check what attributes are needed (getNeededAttributes) and then only load needed.

// TODO: Add compression / decompression (neccassry? -> yes, 1) compression 2) security)
/*
import responseGetCoins from '../../../../test-utils/gecko/responses/response_get_coins_id_full_bitcoin_v3.json';
import {mapGecko2CoinSnapshot} from "../../../../../src/helper/data-provider/gecko/map/map";

describe('Test mapping from gecko api', function () {
    // gecko api docs: https://www.coingecko.com/en/api

    describe('Test mapping response of /coin/{id} to snapshot', function () {
        const snapshot = mapGecko2CoinSnapshot(responseGetCoins);

        it('should extract coin snapshot from response', function () {
            expect( snapshot.rank ).toEqual(1);
            expect( snapshot.price ).toEqual(9237.34);
            expect( snapshot.volume ).toEqual(20138715881);
            expect( snapshot.supply ).toEqual(18425825);
            expect( snapshot.delta ).toEqual(36.917853);
        });

        it('check if price_change_24h equal price_change_percentage_24h * price', function () {
            const old = snapshot.price - snapshot.delta;
            const delta = snapshot.delta / old * 100;
            const price_changed_24h = responseGetCoins.market_data.price_change_percentage_24h;
            expect(price_changed_24h).toBeCloseTo(delta, 4);
        });

        it('check if market cap is product of price and supply', function () {
            // for btc as currency it is exactly the same, in case of usd it varies a little bit
            const marketCap = responseGetCoins.market_data.market_cap.usd;
            const calcMarketCap = snapshot.price * snapshot.supply;
            const relativeDiff = Math.abs((calcMarketCap - marketCap) / marketCap * 100.0);
            expect(relativeDiff).toBeLessThan(0.5);
            expect(relativeDiff).toBeGreaterThanOrEqual(0);
        });
    });

    /*
    describe('Test mapping response of /coin/{id} to coin info basic', function () {
        const info = mapGecko2CoinInfo(responseGetCoins);

        it('should extract coin info from response', function () {
            expect( info.name ).toEqual('Bitcoin');
            expect( info.iconPath ).toEqual('bitcoin');
            expect( info.abbreviation ).toEqual('dkk');
            expect( info.supplyMax ).toEqual(21000000);
            expect( info.genesisDate ).toEqual( 1230940800000 );
        });
    });

});

*/
