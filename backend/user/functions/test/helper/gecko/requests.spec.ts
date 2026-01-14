import {fetchCoinMarketHistory} from '../../../src/helper/gecko/requests/request-coin-history';
import {sampleGeckoHistory} from '../../../src/functions/update/coin/data/sample-coin-history';
import {createDummyGeckoMarketData} from '../../test-utils/dummy-data/gecko';
import {sampleCoins} from '../../../src/functions/update/coin/data/sample-coins';
import {
    disableGeckoTimeSleep,
    spyOnGeckoCoinAndReturnError,
    spyOnGeckoMarketsAndReturnError,
    spyOnGeckoMarketsAndReturnResponse,
    spyOnGeckoRangeAndReturnError,
    spyOnGeckoRangeAndReturnResponse
} from '../../test-utils/mocks/gecko/spy-on-gecko';
import {getCoinIdsFromGecko} from '../../test-utils/mocks/gecko/reponses';
import {fetchCoin} from '../../../src/helper/gecko/requests/request-coin';
import {fetchCoinMarket} from '../../../src/helper/gecko/requests/request-coin-market';
import {disableConsoleLog} from '../../test-utils/disable-console-log';

import {
    lookupCompleteDurationInMinutesOfRange,
    lookupSampledDurationInMinutesOfRange,
    lookupStepWidthInMinutesOfRange,
    sampleDbCurrency
} from '../../../../../../shared-library/src/settings/sampling';
import {
    backupMockLookupCoinInfo,
    setUpLookupCoinInfoMock
} from '../../../../../../shared-library/src/functions/test-utils/lookup-coin-info-mocker/lookup-coin-info-mocker';
import * as fs from 'fs';
import {assetCoin} from '../../../../../../shared-library/src/asset/lookup-asset-factory';
import {AssetIdCoin} from '../../../../../../shared-library/src/asset/assets/coin/interfaces';
import {getTimeRanges} from '../../../../../../shared-library/src/functions/time/get-time-ranges';
import {writeGeckoCoinPageIndex} from '../../../src/helper/cloud-storage/write';
import {useCloudStorageMock} from '../../test-utils/mocks/cloud-storage/use-cloud-storage-mock';

/* eslint-disable @typescript-eslint/camelcase */

describe('Test gecko request functions', function () {

    describe('Offline', function () {

        beforeEach(function () {
            disableConsoleLog();
            disableGeckoTimeSleep();
        });

        describe('Test fetch of detailed coin data', function () {

            it('should return undefined if receive error response', async function () {
                spyOnGeckoCoinAndReturnError();
                const result = await fetchCoin('buh', {});
                expect(result).toBeUndefined();
            });
        });

        describe('Test fetch of market data for multiple ids', function () {

            it('should work with real response (200 ids)', async function () {
                spyOnGeckoMarketsAndReturnResponse();
                const result = await fetchCoinMarket(['whatever', 'mock will return same result']);
                expect(result.length).toEqual(200);
            });

            it('should return empty list if receive an error response', async function () {
                spyOnGeckoMarketsAndReturnError();
                const result = await fetchCoinMarket(assetCoin.getIds());
                expect(result).toEqual([]);
            });
        });

        describe('Test fetch of market chart range data', function () {

            it('should work with real response', async function () {
                spyOnGeckoRangeAndReturnResponse();
                const result = await fetchCoinMarketHistory('buh', 60, 0, 0);
                expect(result.market_caps.length).toBeGreaterThan(0);
            });

            it('should return response with empty attributes if receive error response', async function () {
                spyOnGeckoRangeAndReturnError();
                const result = await fetchCoinMarketHistory('buh', 60, 0, 0);
                expect(result).toEqual({prices: [], total_volumes: [], market_caps: [], errorResponse: true});
            });
        });
    });

    xdescribe('Online', function () {

        function writeResponseToJson(resp: any, name: string): void {
            fs.writeFile(`${name}`, JSON.stringify(resp), function (err) {
                    if (err) {
                        throw err;
                    }
                    console.log('complete');
                }
            );
        }


        describe('Test sample coin from gecko api', function () {

            it('test call for bitcoin', async function () {
                const resp = await fetchCoin('bitcoin', {market_data: true});
                expect(resp.market_data).toBeDefined();
            });

        });

        describe('Test sampling infos for multiple ids (used during update of db every 5 minutes)', function () {

            it('test market call for two coin ids', async function () {
                const ids = ['bitcoin', 'ethereum'];
                const resp = await fetchCoinMarket(ids);
                const expectedAttributes = Object.keys(createDummyGeckoMarketData(''));
                const responseAttributes = Object.keys(resp[0]);
                expectedAttributes.forEach(attr => expect(responseAttributes).toContain(attr));
                expect(resp.length).toEqual(ids.length);
                expect(resp[0].id).toEqual(ids[0]);
                expect(resp[1].id).toEqual(ids[1]);
                //writeResponseToJson(resp, 'response_data_coin_market_2.json');
            });

            it('test market call for 200 ids ', async function () {
                const ids = getCoinIdsFromGecko().slice(0, 200);
                const resp = await fetchCoinMarket(ids);
                const idsFromResp = resp.map(r => r.id);
                ids.forEach(id => expect(idsFromResp).toContain(id));
                idsFromResp.forEach(id => expect(ids).toContain(id));
                expect(resp.length).toEqual(ids.length);
                expect(ids.length).toEqual(200);
                //writeResponseToJson(resp, 'response_data_coin_market_500.json');
            });

            it('test real sampling of coins ', async function () {
                useCloudStorageMock();
                setUpLookupCoinInfoMock(backupMockLookupCoinInfo);
                await writeGeckoCoinPageIndex(0);
                const ids = assetCoin.getIds();
                const resp = await sampleCoins();
                setUpLookupCoinInfoMock();
                const idsFromResp: AssetIdCoin[] = Object.keys(resp.payload);
                ids.forEach(id => expect(idsFromResp).toContain(id));
                idsFromResp.forEach(id => expect(ids).toContain(id));
                expect(resp.meta.ratesTo$[sampleDbCurrency]).toEqual(1);
                expect(idsFromResp.length).toEqual(ids.length);
            }, 75000);
        });

        describe('Test sampling "whole" history for one given coin (used for coin init)', function () {

            it('test call', async function () {
                const durationInMin = 60 * 24;
                const resp = await fetchCoinMarketHistory('bitcoin', durationInMin, 0);
                const first = resp.prices[0][0];
                const last = resp.prices[resp.prices.length - 1][0];
                const timediffInMin = (last - first) / (1000 * 60);
                const diffToExpected = Math.abs(durationInMin - timediffInMin);
                expect(diffToExpected).toBeLessThan(15);
                expect(first).toBeLessThan(last); // should have latest value as last
            });

            it('test real sampling of complete coin history', async function () {
                const id = 'bitcoin';
                const result = await sampleGeckoHistory(id);
                console.log(result.price['1D']);
                expect(result.price['1D'].length).toBeGreaterThan(0);
            });

            xit('No test - sample example history', async function () {
                const id = 'bitcoin';
                for (const range of getTimeRanges()) {
                    const index = 1;
                    const pufferInMin = 2 * lookupStepWidthInMinutesOfRange[range];
                    const delayFrom = lookupCompleteDurationInMinutesOfRange[range] + pufferInMin;
                    const delayTo = lookupCompleteDurationInMinutesOfRange[range] - lookupSampledDurationInMinutesOfRange[range];
                    const sleepFactor = index + 1; // prevent burst of gecko requests
                    await fetchCoinMarketHistory(id, delayFrom, delayTo, sleepFactor).then(resp => {
                        const wrapped = {'success': true, 'message': 'OK', 'code': 200, 'data': resp};
                        return writeResponseToJson(wrapped, `response_gecko_coin_range_bitcoin_${range}.json`);
                    });
                }
            });
        });
    });
});
