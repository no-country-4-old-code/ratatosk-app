import {handleUninitialisedAssets} from '../../../../src/functions/update/coin/data/handle-uninitialised';
import {disableGeckoTimeSleep, spyOnGeckoRangeAndReturnResponse} from '../../../test-utils/mocks/gecko/spy-on-gecko';
import {disableConsoleLog} from '../../../test-utils/disable-console-log';
import {createCoinHistoryStorageSeed} from '../../../test-utils/dummy-data/asset-specific/coin';
import {CoinHistoryStorage} from '../../../../src/helper/interfaces';
import {assetCoin} from '../../../../../../../shared-library/src/asset/lookup-asset-factory';
import {AssetIdCoin} from '../../../../../../../shared-library/src/asset/assets/coin/interfaces';
import {getTimeRanges} from '../../../../../../../shared-library/src/functions/time/get-time-ranges';

describe('Test handling of uninitialised coins ', function () {
    let spyRange: jasmine.Spy;


    beforeEach(function () {
        disableConsoleLog();
        disableGeckoTimeSleep();
        spyRange = spyOnGeckoRangeAndReturnResponse();
    });

    it('should not call gecko api if given storage contain all coins and all coins are initialised', async function () {
        const history = createCoinHistoryStorageSeed(assetCoin.getIds());
        const result = await handleUninitialisedAssets(history);
        expect(spyRange).toHaveBeenCalledTimes(0);
        expect(result).toEqual(history);
    });

    describe('If storage does not contain all coins there should be only updated one coin per "update"-turn which', function () {

        async function act(ids: AssetIdCoin[]): Promise<CoinHistoryStorage> {
            const expectedNumberOfApiCalls = getTimeRanges().length;
            const history = createCoinHistoryStorageSeed(ids);
            const result = await handleUninitialisedAssets(history);
            expect(spyRange).toHaveBeenCalledTimes(expectedNumberOfApiCalls);
            expect(assetCoin.getIdsInStorage(result).length).toEqual(assetCoin.getIdsInStorage(history).length + 1);
            return result;
        }

        it('should work if given storage is empty', async function () {
            await act([]);
        });

        it('should work if given storage contains only one coin', async function () {
            const id = assetCoin.getIds()[0];
            const result = await act([id]);
            expect(result[id]).toBeDefined();
            expect(result[assetCoin.getIds()[1]]).toBeDefined(); // should define next one in row
        });

        it('should work if given storage has only one coin missing', async function () {
            const ids = assetCoin.getIds();
            const missingId: AssetIdCoin = ids.pop() as AssetIdCoin;
            const result = await act(ids);
            expect(result[missingId]).toBeDefined();
        });
    });
});
