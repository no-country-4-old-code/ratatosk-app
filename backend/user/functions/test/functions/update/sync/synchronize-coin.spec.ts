import {synchronizeSamplesWithHistory} from '../../../../src/functions/update/coin/sync/synchronize-samples';
import {CoinSamples} from '../../../../src/functions/update/coin/data/interfaces';
import {createDummyCoinSamples} from '../../../test-utils/dummy-data/samples';
import {createCoinHistoryStorageSeed} from '../../../test-utils/dummy-data/asset-specific/coin';
import {CoinHistoryStorage} from '../../../../src/helper/interfaces';
import {assetCoin} from '../../../../../../../shared-library/src/asset/lookup-asset-factory';
import {AssetIdCoin} from '../../../../../../../shared-library/src/asset/assets/coin/interfaces';
import {calcDelta} from '../../../../../../../shared-library/src/functions/calc-delta';
import {getInvalidIds} from '../../../../../../../shared-library/src/functions/test-utils/dummy-data/ids';
import {getTimeRanges} from '../../../../../../../shared-library/src/functions/time/get-time-ranges';
import {createEmptyTimeSteps} from '../../../../../../../shared-library/src/functions/time/steps';
import {extractSparkline, normalize} from '../../../../src/functions/update/coin/sync/sparkline';
import {numberOfSamplesOfSparkline} from '../../../../../../../shared-library/src/settings/sampling';
import {calculateRsi} from '../../../../src/functions/update/coin/calc/calculate-rsi';


describe('Test synchronize and filter coin ', function () {
    const lowestResolution = getTimeRanges()[0];
    const initValueHistory = 1;
    const initValueCoins = 10;
    let history: CoinHistoryStorage;
    let refCoins: CoinSamples;

    beforeEach(function () {
        const ids = assetCoin.getIds();
        refCoins = createDummyCoinSamples(ids, initValueCoins);
        history = createCoinHistoryStorageSeed(ids, initValueHistory);
        console.log('coin ', initValueCoins);
        // delta, sparkline & rsi are calculated everytime new
        ids.forEach(id => {
            const historyPrice = history[id].price['1D'].slice(0, 287);
            refCoins[id].delta = calcDelta(refCoins[id].price, historyPrice);
            refCoins[id].sparkline = extractSparkline(refCoins[id].price, historyPrice, numberOfSamplesOfSparkline);
            refCoins[id].sparkline = normalize(refCoins[id].sparkline, 255);
            refCoins[id].rsi = calculateRsi(refCoins[id].price, history[id].price);
        });
    });

    describe('Synchronize to make sure published coins equals coins in assetCoin.getIds() ', function () {

        it('should return coins unmodified if valid (with exception of delta, sparkline & rsi, see bfe)', function () {
            const filteredCoins = synchronizeSamplesWithHistory(refCoins, history);
            expect(filteredCoins).toEqual(refCoins);
        });

        it('should rmv coins if not supported', function () {
            const coins = createDummyCoinSamples([...assetCoin.getIds(), ...getInvalidIds()], initValueCoins);
            const filteredCoins = synchronizeSamplesWithHistory(coins, history);
            expect(filteredCoins).toEqual(refCoins);
        });

        it('should ignore coin if not in coins and with not initialised history', function () {
            const coinIds = assetCoin.getIds();
            const missingCoin = coinIds.pop() as AssetIdCoin;
            history[missingCoin] = assetCoin.createEmptyHistory();
            const coins = createDummyCoinSamples(coinIds, initValueCoins);
            const filteredCoins = synchronizeSamplesWithHistory(coins, history);
            expect(filteredCoins[missingCoin]).toBeUndefined();
        });

        it('should build missing coins using old values from history', function () {
            const coinIds = assetCoin.getIds();
            const missingCoin = coinIds.pop() as AssetIdCoin;
            const coins = createDummyCoinSamples(coinIds, initValueCoins);
            const filteredCoins = synchronizeSamplesWithHistory(coins, history);
            coinIds.forEach(id => expect(filteredCoins[id]).toEqual(refCoins[id]));
            expect(filteredCoins[missingCoin].price).toEqual(history[missingCoin].price[lowestResolution][0]);
            expect(filteredCoins[missingCoin].volume).toEqual(history[missingCoin].volume[lowestResolution][0]);
        });

        it('should build missing coins using nan for attributes without history', function () {
            const coinIds = assetCoin.getIds();
            const missingCoin = coinIds.pop() as AssetIdCoin;
            history[missingCoin].volume = createEmptyTimeSteps();
            const coins = createDummyCoinSamples(coinIds, initValueCoins);
            const filteredCoins = synchronizeSamplesWithHistory(coins, history);
            coinIds.forEach(id => expect(filteredCoins[id]).toEqual(refCoins[id]));
            expect(filteredCoins[missingCoin].price).toEqual(history[missingCoin].price[lowestResolution][0]);
            expect(filteredCoins[missingCoin].volume).toEqual(NaN);
        });

        it('should handle mixed scenarios', function () {
            const coins = createDummyCoinSamples(getInvalidIds());
            const filteredCoins = synchronizeSamplesWithHistory(coins, history);
            expect(assetCoin.getIdsInStorage(filteredCoins).length).toEqual(assetCoin.getIds().length);
            assetCoin.getIds().forEach((id: AssetIdCoin) => expect(filteredCoins[id].price).toEqual(history[id].price[lowestResolution][0]));
        });
    });

    describe('Synchronize to make sure every coin has every attribute', function () {
        let coins: CoinSamples;
        let specialId: AssetIdCoin;

        beforeEach(function () {
            coins = createDummyCoinSamples(assetCoin.getIds(), initValueCoins);
            specialId = assetCoin.getIds()[2];
            delete coins[specialId].volume;
        });

        it('should build missing attribute using old value from history', function () {
            const filteredCoins = synchronizeSamplesWithHistory(coins, history);
            expect(coins[specialId].volume).toBeUndefined();
            expect(filteredCoins[specialId].volume).toEqual(history[specialId].volume[lowestResolution][0]);
        });

        it('should build missing attribute using nan if no history available', function () {
            history[specialId].volume = createEmptyTimeSteps();
            const filteredCoins = synchronizeSamplesWithHistory(coins, history);
            expect(coins[specialId].volume).toBeUndefined();
            expect(filteredCoins[specialId].volume).toEqual(NaN);
        });
    });
});
