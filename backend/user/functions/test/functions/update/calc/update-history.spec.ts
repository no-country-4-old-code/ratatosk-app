import {disableConsoleLog} from '../../../test-utils/disable-console-log';
import {CoinSample, CoinSamples} from '../../../../src/functions/update/coin/data/interfaces';
import {createFullCoinSample} from '../../../test-utils/dummy-data/samples';
import {createCoinHistoryStorageEmpty} from '../../../test-utils/dummy-data/asset-specific/coin';
import {updateHistory} from '../../../../src/functions/update/coin/calc/update-history';
import {CoinHistoryStorage} from '../../../../src/helper/interfaces';
import {
    lookupBufferSizeOfRange,
    lookupNumberOfSamplesOfRange
} from '../../../../../../../shared-library/src/settings/sampling';
import {assetCoin} from '../../../../../../../shared-library/src/asset/lookup-asset-factory';
import {AssetIdCoin} from '../../../../../../../shared-library/src/asset/assets/coin/interfaces';
import {lowestTimeRange} from '../../../../../../../shared-library/src/functions/time/get-time-ranges';


describe('Test updateHistory(...)', function () {
    let history: CoinHistoryStorage, buffer: CoinHistoryStorage;

    function act(newCoins: CoinSamples[]) {
        newCoins.forEach((samples: CoinSamples) => updateHistory(history, samples, buffer));
    }

    function createTestCoinSamplesArray(length: number): CoinSamples[] {
        let count = 0;
        return Array.from({length: length}, () => {
            count++;
            const fakeStore: any = {};
            assetCoin.getIds().forEach((coinId: AssetIdCoin) => (fakeStore[coinId] = assetCoin.createNaNSnapshot()));
            fakeStore['id0'] = createSamplesWithIdPriceVolume(0.1 * count, count);
            fakeStore['id42'] = createSamplesWithIdPriceVolume(10 * count, 100 * Math.pow(-1, count));
            return fakeStore;
        }) as CoinSamples[];
    }

    function createSamplesWithIdPriceVolume(price: number, volume: number): CoinSample {
        const coin = createFullCoinSample(-1);
        coin['price'] = price;
        coin['volume'] = volume;
        return coin;
    }

    beforeEach(() => {
        disableConsoleLog();
        history = createCoinHistoryStorageEmpty(['id0', 'id42']);
        buffer = createCoinHistoryStorageEmpty(['id0', 'id42']);
    });

    describe('Test normal sampling', function () {

        it('should add first sample to history', function () {
            const newCoins = createTestCoinSamplesArray(1);
            act(newCoins);
            expect(history['id0'].price['1D']).toEqual([0.1]);
            expect(history['id0'].price['1W']).toEqual([]);
            expect(history['id0'].volume['1D']).toEqual([1]);
            expect(history['id0'].volume['1W']).toEqual([]);
            expect(history['id42'].price['1D']).toEqual([10]);
            expect(history['id42'].price['1W']).toEqual([]);
            expect(history['id42'].volume['1D']).toEqual([-100]);
            expect(history['id42'].volume['1W']).toEqual([]);
        });

        it('should add first five sample to history of range 1D and none to history of 1W', function () {
            const newCoins = createTestCoinSamplesArray(5);
            act(newCoins);
            expect(history['id0'].volume['1D']).toEqual([5, 4, 3, 2, 1]);
            expect(history['id0'].volume['1W']).toEqual([]);
            expect(history['id0'].volume['1M']).toEqual([]);
            expect(history['id42'].price['1D']).toEqual([50, 40, 30, 20, 10]);
            expect(history['id42'].price['1W']).toEqual([]);
            expect(history['id42'].price['1M']).toEqual([]);
        });

        it('should add first six sample to history of range 1D and average to history of 1W', function () {
            const maxNumberOfSamplesIn1D = lookupNumberOfSamplesOfRange[lowestTimeRange];
            const bufferSize = lookupBufferSizeOfRange['1W'];
            const newCoins = createTestCoinSamplesArray(maxNumberOfSamplesIn1D + bufferSize);
            act(newCoins);
            expect(history['id0'].volume['1D'].length).toEqual(maxNumberOfSamplesIn1D);
            expect(history['id0'].volume['1W']).toEqual([6.5]);
            expect(history['id0'].volume['1M']).toEqual([]);
            expect(history['id42'].price['1D'].length).toEqual(maxNumberOfSamplesIn1D);
            expect(history['id42'].price['1W']).toEqual([65]);
            expect(history['id42'].price['1M']).toEqual([]);
        });
    });
});
