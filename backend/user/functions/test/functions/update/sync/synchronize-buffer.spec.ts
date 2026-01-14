import {CoinHistoryStorage} from '../../../../src/helper/interfaces';
import {synchronizeBufferWithCoinIds} from '../../../../src/functions/update/coin/sync/synchronize-buffer';
import {createCoinHistoryStorageSeed} from '../../../test-utils/dummy-data/asset-specific/coin';
import {assetCoin} from '../../../../../../../shared-library/src/asset/lookup-asset-factory';
import {AssetIdCoin} from '../../../../../../../shared-library/src/asset/assets/coin/interfaces';
import {getInvalidIds} from '../../../../../../../shared-library/src/functions/test-utils/dummy-data/ids';
import {createEmptyTimeSteps} from '../../../../../../../shared-library/src/functions/time/steps';


describe('Test synchronize and filter coin ', function () {
    const initValueCoins = 10;
    let refBuffer: CoinHistoryStorage;

    beforeEach(function () {
        refBuffer = createCoinHistoryStorageSeed(assetCoin.getIds(), initValueCoins);
    });


    describe('Synchronize to make sure to have a buffer for each initialised, supported coin', function () {

        describe('If coins already in buffer', function () {

            it('should return buffer unmodified if every coin is already listed', function () {
                const filteredBuffer = synchronizeBufferWithCoinIds(refBuffer, refBuffer);
                expect(filteredBuffer).toEqual(refBuffer);
            });

            it('should rmv coins which are not supported by the app anymore', function () {
                const buffer = createCoinHistoryStorageSeed([...assetCoin.getIds(), ...getInvalidIds()], initValueCoins);
                const filteredBuffer = synchronizeBufferWithCoinIds(buffer, buffer);
                expect(filteredBuffer).toEqual(refBuffer);
            });

            it('should add missing attributes to coin as empty array', function () {
                const selectedId = assetCoin.getIds()[2];
                const buffer = createCoinHistoryStorageSeed(assetCoin.getIds(), initValueCoins);
                delete buffer[selectedId].volume;
                const filteredBuffer = synchronizeBufferWithCoinIds(buffer, buffer);
                expect(buffer[selectedId].volume).toBeUndefined();
                expect(filteredBuffer[selectedId].volume).toEqual(createEmptyTimeSteps());
            });
        });

        describe('If coins not in buffer', function () {

            it('should ignore not supported coins', function () {
                const coinIds = assetCoin.getIds();
                const buffer = createCoinHistoryStorageSeed(coinIds, initValueCoins);
                const filteredBuffer = synchronizeBufferWithCoinIds(buffer, buffer);
                getInvalidIds().forEach(id => expect(filteredBuffer[id]).toBeUndefined());
            });

            it('should add supported coins if initialised', function () {
                const coinIds = assetCoin.getIds();
                const missingCoin = coinIds.pop() as AssetIdCoin;
                const buffer = createCoinHistoryStorageSeed(coinIds, initValueCoins);
                const history = createCoinHistoryStorageSeed(assetCoin.getIds(), initValueCoins);
                const filteredBuffer = synchronizeBufferWithCoinIds(buffer, history);
                coinIds.forEach(id => expect(filteredBuffer[id]).toEqual(refBuffer[id]));
                expect(filteredBuffer[missingCoin]).toEqual(assetCoin.createEmptyHistory());
            });

            it('should ignore supported coins if not initialised', function () {
                const coinIds = assetCoin.getIds();
                const missingCoin = coinIds.pop() as AssetIdCoin;
                const buffer = createCoinHistoryStorageSeed(coinIds, initValueCoins);
                const history = createCoinHistoryStorageSeed(coinIds, initValueCoins);
                const filteredBuffer = synchronizeBufferWithCoinIds(buffer, history);
                coinIds.forEach(id => expect(filteredBuffer[id]).toEqual(refBuffer[id]));
                expect(filteredBuffer[missingCoin]).toBeUndefined();
            });

            it('should handle complex scenarios', function () {
                const validCoin = assetCoin.getIds()[0];
                const buffer = createCoinHistoryStorageSeed([...getInvalidIds(), validCoin]);
                const filteredBuffer = synchronizeBufferWithCoinIds(buffer, buffer);
                expect(assetCoin.getIdsInStorage(filteredBuffer).length).toEqual(1);
            });
        });
    });
});
