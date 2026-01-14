import {deepCopy} from '../../../../../../shared-library/src/functions/general/object';
import {CoinSamples, UpdateDbData} from '../../../src/functions/update/coin/data/interfaces';
import {createDummyCoinSamples} from '../../test-utils/dummy-data/samples';
import {disableConsoleLog} from '../../test-utils/disable-console-log';
import {AssetIdCoin, MetricCoinHistory} from '../../../../../../shared-library/src/asset/assets/coin/interfaces';

import {
    createCoinHistoryStorageEmpty,
    createCoinHistoryStorageSeed
} from '../../test-utils/dummy-data/asset-specific/coin';
import {getDummyExchangeRates} from '../../../../../../shared-library/src/functions/test-utils/dummy-data/currency';
import {CoinHistoryStorage} from '../../../src/helper/interfaces';
import {createArray, createRangeArray} from '../../../../../../shared-library/src/functions/general/array';
import {MetaData} from '../../../../../../shared-library/src/datatypes/meta';
import {doUpdate} from '../../../src/functions/update/coin/update-db';
import {sampleIntervalInMinutes} from '../../../../../../shared-library/src/settings/sampling';
import {assetCoin} from '../../../../../../shared-library/src/asset/lookup-asset-factory';
import {TimeSteps} from '../../../../../../shared-library/src/datatypes/time';
import {getInvalidIds} from '../../../../../../shared-library/src/functions/test-utils/dummy-data/ids';
import {getTimeRanges} from '../../../../../../shared-library/src/functions/time/get-time-ranges';
import {createEmptyTimeSteps, createTimeSteps} from '../../../../../../shared-library/src/functions/time/steps';


describe('Test database update', function () {
    let coins: CoinSamples, history: CoinHistoryStorage, buffer: CoinHistoryStorage;
    const initValueCoin = 1;
    const initValueHistory = initValueCoin + 10;
    const lowestResolution = '1D';
    const meta: MetaData = {timestampMs: 123, unit: 'usd', ratesTo$: getDummyExchangeRates()};


    let db: UpdateDbData;

    function run(): UpdateDbData {
        return doUpdate(history, coins, buffer, meta);
    }

    beforeEach(() => {
        disableConsoleLog();
        setStorageToIds([]);
    });

    function setStorageToIds(ids: AssetIdCoin[]): void {
        coins = createDummyCoinSamples(ids, initValueCoin);
        history = createCoinHistoryStorageSeed(ids, initValueHistory);
        buffer = createCoinHistoryStorageEmpty(ids);
    }

    function expectIdHasNewValue(id: AssetIdCoin, db: UpdateDbData): void {
        assetCoin.getMetricsHistory().forEach(attr => {
            expect(db.samples[id][attr]).toEqual(db.history[id][attr][lowestResolution][0]);
            // next statement is only relevant for testing purpose.
            // New coin should differ from old to detect the change !
            expect(db.samples[id][attr]).not.toEqual(db.history[id][attr][lowestResolution][1]);
        });
    }

    function expectIdReuseOldValue(id: AssetIdCoin, db: UpdateDbData): void {
        const notReusableAttr = ['rsi']; // attributes which are calculated from the history of other have to be recalculated
        assetCoin.getMetricsHistory().filter(attr => !notReusableAttr.includes(attr)).forEach(attr => {
            expect(db.samples[id][attr]).toEqual(db.history[id][attr][lowestResolution][0]);
            expect(db.samples[id][attr]).toEqual(db.history[id][attr][lowestResolution][1]);
        });
    }

    function expectIdNotExistInDb(id: AssetIdCoin, db: UpdateDbData): void {
        expect(db.history[id]).toBeUndefined();
        expect(db.buffer[id]).toBeUndefined();
        expect(db.samples[id]).toBeUndefined();
    }


    it('make sure test is valid ', function () {
        const validCoinIds = assetCoin.getIds();
        const invlaidCoinIds = getInvalidIds();
        invlaidCoinIds.forEach(id => expect(validCoinIds).not.toContain(id));
    });

    describe('Storage contain only ids of supported and initialised coins', function () {

        function expectIdsEqualValidIds(db: UpdateDbData): void {
            const coinIdsValid = assetCoin.getIds();
            [db.buffer, db.samples, db.history].forEach(storage => {
                const idsOfObj = assetCoin.getIdsInStorage(storage);
                expect(idsOfObj).toEqual(coinIdsValid);
            });
        }

        it('should contain all ids which are initialised (pass is initialised check)', function () {
            setStorageToIds([]);
            history = createCoinHistoryStorageEmpty(assetCoin.getIds());
            assetCoin.getIds().forEach(id => {
                history[id].price['1D'] = [1, 2]; // trick init check in database
            });
            db = run();
            expectIdsEqualValidIds(db);
        });

        it('should contain all ids if start with all ids in storage', function () {
            setStorageToIds(assetCoin.getIds());
            db = run();
            expectIdsEqualValidIds(db);
        });

        it('should contain all valid ids if start with mix of valid / invalid ids in storage', function () {
            const illCoins = [getInvalidIds()[0], ...assetCoin.getIds()];
            setStorageToIds(illCoins);
            db = run();
            expectIdsEqualValidIds(db);
        });
    });

    describe('Coins with history should be updated with old coin if no new information available', function () {

        it('should update with old value if history hold it and not in samples (one missing)', function () {
            const coinIds = assetCoin.getIds();
            history = createCoinHistoryStorageSeed(coinIds, initValueHistory);
            const missingId = coinIds.pop() as AssetIdCoin;
            coins = createDummyCoinSamples(coinIds, initValueCoin);

            db = run();
            expectIdReuseOldValue(missingId, db);
            coinIds.forEach(id => expectIdHasNewValue(id, db));
            expect(db.samples[missingId]).toBeDefined();
        });

        it('should update with old value if history hold it and not in samples (empty samples)', function () {
            history = createCoinHistoryStorageSeed(assetCoin.getIds(), initValueHistory);
            coins = createDummyCoinSamples([], initValueCoin);

            db = run();
            assetCoin.getIds().forEach(id => expectIdReuseOldValue(id, db));
        });

        it('should update with NaN for attributes which have no values in history yet', function () {
            /*
             If a new coin is initialised (put into history) but it is not in sampled coins, doUpdate tries to build
             new values from old values. But e.g. in case of "rank" there are no history values because it was left out during
             initialisation.
             */
            const newCoin = assetCoin.getIds()[2];
            const otherCoins = assetCoin.getIds().filter(id => id !== newCoin);
            setStorageToIds(otherCoins);
            history = createCoinHistoryStorageSeed(assetCoin.getIds(), initValueHistory);
            history[newCoin].rank = createEmptyTimeSteps();

            db = run();
            otherCoins.forEach(id => expectIdHasNewValue(id, db));
            expect(db.history[newCoin].price['1D'][0]).not.toBeNaN();
            expect(db.history[newCoin].rank['1D'][0]).toBeNaN();
            expect(db.samples[newCoin]).toBeDefined();
        });
    });

    describe('Coins with NaN values are handled like normal coins', function () {
        const nanCoin = assetCoin.getIds()[2];
        const notNanCoins = assetCoin.getIds().filter(id => id !== nanCoin);

        beforeEach(function () {
            setStorageToIds(assetCoin.getIds());
            coins[nanCoin].price = NaN;
            coins[nanCoin].rank = NaN;
            coins[nanCoin].supply = 12345;
        });

        it('should do regular update', function () {
            db = run();
            assetCoin.getIds().forEach(id => expectIdHasNewValue(id, db));
            expect(db.samples[nanCoin].price).toBeNaN();
            expect(db.samples[nanCoin].rank).toBeNaN();
            expect(db.samples[nanCoin].supply).toEqual(12345);
            expect(db.samples[nanCoin].volume).not.toBeNaN();
            expect(db.history[nanCoin].price['1D'][0]).toBeNaN();
            expect(db.history[nanCoin].price['1W'][0]).not.toBeNaN();
        });

        it('should use NaN in calculation for next history step after multiply updates', function () {
            createRangeArray(300).forEach(() => {
                db = run();
                buffer = db.buffer;
            });
            notNanCoins.forEach(id => expect(db.samples[id]).not.toBeNaN());
            expect(db.history[nanCoin].price['1D'][0]).toBeNaN();
            expect(db.history[nanCoin].price['1W'][0]).toBeNaN();
        });
    });

    describe('Coins without initialised history does not exist in database after update', function () {

        it('should skip update if history and sample do not contain coin', function () {
            const coinIds = assetCoin.getIds();
            const missingId = coinIds.pop() as AssetIdCoin;
            history = createCoinHistoryStorageSeed(coinIds, initValueHistory);
            coins = createDummyCoinSamples(coinIds, initValueCoin);

            db = run();
            expectIdNotExistInDb(missingId, db);
            coinIds.forEach(id => expectIdHasNewValue(id, db));
        });

        it('should skip update if history is empty and sample not contain coin', function () {
            const coinIds = assetCoin.getIds();
            history = createCoinHistoryStorageSeed(coinIds, initValueHistory);
            const missingId = coinIds.pop() as AssetIdCoin;
            history[missingId] = assetCoin.createEmptyHistory();
            coins = createDummyCoinSamples(coinIds, initValueCoin);

            db = run();
            expectIdNotExistInDb(missingId, db);
            coinIds.forEach(id => expectIdHasNewValue(id, db));
        });
    });

    describe('Coins with initialised history should be updated with sampled data', function () {

        it('should update db with new sample for coin if coin id is in history, buffer amd sampled coins', function () {
            setStorageToIds(assetCoin.getIds());
            db = run();
            assetCoin.getIds().forEach(id => expectIdHasNewValue(id, db));
        });

        it('should update db with new sample for coin if coin id is in history amd sampled coins', function () {
            coins = createDummyCoinSamples(assetCoin.getIds(), initValueCoin);
            history = createCoinHistoryStorageSeed(assetCoin.getIds(), initValueHistory);
            db = run();
            assetCoin.getIds().forEach(id => expectIdHasNewValue(id, db));
        });

        it('should not update db with new sample for coin if coin id is not in history', function () {
            coins = createDummyCoinSamples(assetCoin.getIds(), initValueCoin);
            buffer = createCoinHistoryStorageEmpty(assetCoin.getIds());
            db = run();
            assetCoin.getIds().forEach(id => expectIdNotExistInDb(id, db));
        });

        it('should handle mixed scenarios', function () {
            const coinsInHistoryAndSample = assetCoin.getIds().slice(0, 2);
            const coinsOnlyInSample = assetCoin.getIds().slice(2);
            coins = createDummyCoinSamples(assetCoin.getIds(), initValueCoin);
            history = createCoinHistoryStorageSeed(coinsInHistoryAndSample, initValueHistory);
            db = run();
            coinsInHistoryAndSample.forEach(id => expectIdHasNewValue(id, db));
            coinsOnlyInSample.forEach(id => expectIdNotExistInDb(id, db));
        });
    });

    describe('The samples for each range should not be exceed', function () {
        const coinId: AssetIdCoin = 'id1';
        const attr: MetricCoinHistory = 'supply';
        let refFullyFilledSteps: TimeSteps;

        beforeEach(function () {
            setStorageToIds([coinId]);
            history[coinId][attr] = createEmptyTimeSteps();
            history[coinId]['price']['1D'] = [1, 2]; // trick check is coin is initialised
            refFullyFilledSteps = createTimeSteps(42);
        });

        function act(numberOfIterations: number): void {
            createArray(numberOfIterations, 0).forEach(() => {
                db = run();
                history = db.history;
                buffer = db.buffer;
                coins = db.samples;
            });
        }

        it('should start with empty coin history per default', () => {
            getTimeRanges().forEach(range => {
                expect(history[coinId][attr][range].length).toEqual(0);
            });
        });

        it('should fill empty coin history but never exceed maximum number of samples', () => {
            const minutesOf2Weeks = 60 * 24 * 7 * 2; // biggest step size (of range ALL)
            const numberOfIterations = minutesOf2Weeks / sampleIntervalInMinutes;
            act(numberOfIterations);
            expect(history[coinId][attr]['1D'].length).toEqual(refFullyFilledSteps['1D'].length);
            expect(history[coinId][attr]['1W'].length).toEqual(refFullyFilledSteps['1W'].length);
        });

        it('should fill empty coin history but never exceed maximum number of samples (start with full)', () => {
            history[coinId][attr] = deepCopy(refFullyFilledSteps);
            const minutesOf2Weeks = 60 * 24 * 7 * 2; // biggest step size (of range ALL)
            const numberOfIterations = minutesOf2Weeks / sampleIntervalInMinutes;
            act(numberOfIterations);
            getTimeRanges().forEach(range => {
                const numOfSamples = history[coinId][attr][range].length;
                const maxNumOfSamples = refFullyFilledSteps[range].length;
                const errMsg = `For ${range} current number of samples ${numOfSamples} is not expected ${maxNumOfSamples}`;
                expect(numOfSamples === maxNumOfSamples).toBeTruthy(errMsg);
            });
        });

        it('should overwrite existing samples (for 1D and 1W) with coin in coin', () => {
            const specialCoinValue = Math.round(Math.random() * 123);
            coins = createDummyCoinSamples([coinId], specialCoinValue);
            history[coinId][attr]['1D'] = [4, 4, 3, 2, 1, -42, 1450.23];
            history[coinId][attr]['1W'] = [2, 2134.33, -22, 3];
            const minutesOf1Week = 60 * 24 * 7 + 5 + 60; // complete range of 1D + 2 extra samples
            const numberOfIterations = minutesOf1Week / sampleIntervalInMinutes;
            act(numberOfIterations);
            expect(history[coinId][attr]['1D']).toEqual(createArray(refFullyFilledSteps['1D'].length, specialCoinValue));
            expect(history[coinId][attr]['1W']).toEqual(createArray(refFullyFilledSteps['1W'].length, specialCoinValue));
        });
    });
});

