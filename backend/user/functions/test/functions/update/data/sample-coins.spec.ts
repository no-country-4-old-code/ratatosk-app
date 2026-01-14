import {maxGeckoMarketCoinPerPage} from '../../../../src/helper/gecko/requests/request-coin-market';
import {Meta} from '../../../../../../../shared-library/src/datatypes/meta';
import {maxGeckoCoinPageSize, sampleCoins} from '../../../../src/functions/update/coin/data/sample-coins';
import {lookupCoinInfo} from '../../../../../../../shared-library/src/asset/assets/coin/helper/lookup-coin-info-basic';
import {
    disableGeckoTimeSleep,
    spyOnGeckoCoinAndReturnResponse,
    spyOnGeckoMarketsAndReturnError,
    spyOnGeckoMarketsAndReturnForIds
} from '../../../test-utils/mocks/gecko/spy-on-gecko';

import {sampleDbCurrency} from '../../../../../../../shared-library/src/settings/sampling';
import {
    createFakeLookupCoinInfo,
    setUpLookupCoinInfoMock
} from '../../../../../../../shared-library/src/functions/test-utils/lookup-coin-info-mocker/lookup-coin-info-mocker';
import {deepCopy} from '../../../../../../../shared-library/src/functions/general/object';
import {createRangeArray} from '../../../../../../../shared-library/src/functions/general/array';
import {getCurrencies} from '../../../../../../../shared-library/src/functions/currency';
import {fetchCoin} from '../../../../src/helper/gecko/requests/request-coin';
import {
    useFirestoreMock
} from '../../../../../../shared-backend-library/src/test-utils/firestore-mock/use-firestore-mock';
import {CoinSamples} from '../../../../src/functions/update/coin/data/interfaces';
import {writeGeckoCoinPageIndex} from '../../../../src/helper/cloud-storage/write';
import {useCloudStorageMock} from '../../../test-utils/mocks/cloud-storage/use-cloud-storage-mock';
import {assetCoin} from '../../../../../../../shared-library/src/asset/lookup-asset-factory';
import {AssetIdCoin} from '../../../../../../../shared-library/src/asset/assets/coin/interfaces';

describe('Test sample coins data from gecko', function () {
    let spyMarket: jasmine.Spy, spyCoin: jasmine.Spy;
    const numberOfReadCoinsPerCall = 38;

    beforeEach(async function () {
        //disableConsoleLog();
        disableGeckoTimeSleep();
        useFirestoreMock();
        useCloudStorageMock();
        await writeGeckoCoinPageIndex(0);
    });

    function act(): Promise<Meta<CoinSamples>> {
        spyCoin = spyOnGeckoCoinAndReturnResponse();
        spyMarket = spyOnGeckoMarketsAndReturnForIds();
        return sampleCoins();
    }

    describe('Test fetch of coin data from gecko market call', function () {

        it('should call gecko web api once to fetch coin market for all supported coins', async function () {
            const expectedMarketCalls = Math.ceil(assetCoin.getIds().length / maxGeckoMarketCoinPerPage);
            await act();
            expect(spyMarket).toHaveBeenCalledTimes(expectedMarketCalls);
            expect(spyMarket.calls.allArgs()[0][0].ids).toEqual(assetCoin.getIds().slice(0, maxGeckoMarketCoinPerPage));
        });

        it('should have snapshot for every coin', async function () {
            const result = await act();
            const sampledIds = Object.keys(result.payload);
            assetCoin.getIds().forEach(id => expect(sampledIds).toContain(id));
            sampledIds.forEach(id => expect(result.payload[id].price).toBeDefined());
            expect(sampledIds.length).toEqual(assetCoin.getIds().length);
        });

        it('should return empty array of snapshots if gecko fetch market failed', async function () {
            spyOnGeckoCoinAndReturnResponse();
            spyMarket = spyOnGeckoMarketsAndReturnError();
            const result = await sampleCoins();
            const sampledIds = Object.keys(result.payload);
            expect(sampledIds.length).toEqual(0);
        });
    });

    describe('Test fetch of meta data (use gecko coin call)', function () {

        it(`should fill meta data with current date, ${sampleDbCurrency} as currency and exchange rates`, async function () {
            const randomTimestampMs = Math.random() * 123456;
            spyOn(Date, 'now').and.returnValue(randomTimestampMs);
            // act
            const result = await act();
            // assert
            expect(result.meta.timestampMs).toEqual(randomTimestampMs);
            expect(result.meta.unit).toEqual(sampleDbCurrency);
            expect(result.meta.ratesTo$[sampleDbCurrency]).toEqual(1);
            expect(result.meta.ratesTo$['eur']).not.toEqual(result.meta.ratesTo$['dkk']);
        });

        it('should fill exchange rates (price[baseCurrency] * rates[eur] === price[eur] for eur, btc, usd, etc)', async function () {
            const result = await act();
            const prices = (await fetchCoin(assetCoin.getIds()[0], {})).market_data.current_price;
            const rates = result.meta.ratesTo$;
            const priceInBaseCurrency = prices[sampleDbCurrency];
            // assert
            getCurrencies().forEach(currency => {
                expect(priceInBaseCurrency * rates[currency]).toBeCloseTo(prices[currency], 5);
            });
        });
    });

    describe('Test fetch of advanced coin data (only accessible via gecko coin call)', function () {
        const backup = deepCopy(lookupCoinInfo);
        const numberOfCalls = maxGeckoCoinPageSize;

        afterEach(function () {
            setUpLookupCoinInfoMock(backup);
        });

        function actWithCoins(numberOfSupportedCoins: number): Promise<Meta<CoinSamples>> {
            const fakeLookupCoinInfo = createFakeLookupCoinInfo(numberOfSupportedCoins);
            setUpLookupCoinInfoMock(fakeLookupCoinInfo);
            return act();
        }

        it('should fetch advanced data once for meta and once for each coin', async function () {
            await actWithCoins(10);
            expect(spyCoin).toHaveBeenCalledTimes(11);
        });

        it('should not fetch advanced data for more coins as needed (besides meta)', async function () {
            await actWithCoins(numberOfCalls - 1);
            expect(spyCoin).toHaveBeenCalledTimes(numberOfCalls);
        });

        it(`should fetch advanced data for ${numberOfCalls} coins in one update run (besides meta)`, async function () {
            await actWithCoins(numberOfCalls);
            expect(spyCoin).toHaveBeenCalledTimes(numberOfCalls + 1);
        });

        it(`should not fetch advanced data for more then ${numberOfCalls} coins in one update run (besides meta)`, async function () {
            await actWithCoins(numberOfCalls + 1);
            expect(spyCoin).toHaveBeenCalledTimes(numberOfCalls + 1);
        });

        it(`should fetch first ${numberOfCalls} coins if page offset in storage is 0`, async function () {
            // write to storage
            await writeGeckoCoinPageIndex(0);
            await actWithCoins(maxGeckoCoinPageSize + 2);
            const calledIds = spyCoin.calls.allArgs().map(ele => ele[0]).slice(1);
            const expectedIds = createRangeArray(maxGeckoCoinPageSize, 0).map(n => `id${n}`);
            expect(calledIds).toEqual(expectedIds);
        });

        it('should paginated through coins from update to update based on page offset in storage', async function () {
            await writeGeckoCoinPageIndex(1);
            await actWithCoins(maxGeckoCoinPageSize + 2);
            const calledIds = spyCoin.calls.allArgs().map(ele => ele[0]).slice(1);
            const expectedIds = [maxGeckoCoinPageSize, maxGeckoCoinPageSize + 1].map(n => `id${n}`);
            expect(calledIds).toEqual(expectedIds);
        });

        it('should handle too big gecko coin page index', async function () {
            await writeGeckoCoinPageIndex(666);
            await actWithCoins(maxGeckoCoinPageSize + 2);
            const calledIds = spyCoin.calls.allArgs().map(ele => ele[0]).slice(1);
            const expectedIds: AssetIdCoin[] = [];
            expect(calledIds).toEqual(expectedIds);
        });

        it('should fill attributes with values if selected and with "undefined" otherwise (page == 0)', async function () {
            const numberOfCoins = 111;
            await writeGeckoCoinPageIndex(0);
            const result = await actWithCoins(numberOfCoins);
            createRangeArray(numberOfReadCoinsPerCall, 0).forEach(idx => {
                expect(result.payload[`id${idx}`].redditScore).toBeDefined();
            });
            createRangeArray(numberOfCoins - numberOfReadCoinsPerCall, numberOfReadCoinsPerCall).forEach(idx => {
                expect(result.payload[`id${idx}`].redditScore).toBeUndefined();
            });
        });

        it('should fill attributes with values if selected and with "undefined" otherwise (page == 2)', async function () {
            const numberOfCoins = 111;
            await writeGeckoCoinPageIndex(1);
            const result = await actWithCoins(numberOfCoins);
            createRangeArray(numberOfReadCoinsPerCall, 0).forEach(idx => {
                expect(result.payload[`id${idx}`].redditScore).toBeUndefined();
            });
            createRangeArray(numberOfReadCoinsPerCall, numberOfReadCoinsPerCall).forEach(idx => {
                expect(result.payload[`id${idx}`].redditScore).toBeDefined();
            });
            createRangeArray(numberOfCoins - numberOfReadCoinsPerCall * 2, numberOfReadCoinsPerCall * 2).forEach(idx => {
                expect(result.payload[`id${idx}`].redditScore).toBeUndefined();
            });
        });
    });
});
