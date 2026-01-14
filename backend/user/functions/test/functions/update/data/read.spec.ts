import {queryData} from '../../../../src/functions/update/coin/data/read';
import {maxGeckoMarketCoinPerPage} from '../../../../src/helper/gecko/requests/request-coin-market';
import {maxGeckoCoinPageSize} from '../../../../src/functions/update/coin/data/sample-coins';
import {useCloudStorageMock} from '../../../test-utils/mocks/cloud-storage/use-cloud-storage-mock';
import {readCoinBufferBucket, readCoinHistoryBucket} from '../../../../src/helper/cloud-storage/read';
import {
    writeCoinBuffer,
    writeCoinHistoryCompact,
    writeGeckoCoinPageIndex
} from '../../../../src/helper/cloud-storage/write';
import {
    disableGeckoTimeSleep,
    spyOnGeckoCoinAndReturnError,
    spyOnGeckoCoinAndReturnResponse,
    spyOnGeckoMarketsAndReturnForIds,
    spyOnGeckoRangeAndReturnResponse
} from '../../../test-utils/mocks/gecko/spy-on-gecko';

import {
    createCoinHistoryStorageEmpty,
    createCoinHistoryStorageSeed
} from '../../../test-utils/dummy-data/asset-specific/coin';
import {createDummyMetaData} from '../../../../../../../shared-library/src/functions/test-utils/dummy-data/meta';
import {MetaData} from '../../../../../../../shared-library/src/datatypes/meta';
import {
    useFirestoreMock
} from '../../../../../../shared-backend-library/src/test-utils/firestore-mock/use-firestore-mock';
import {assetCoin} from '../../../../../../../shared-library/src/asset/lookup-asset-factory';
import {AssetIdCoin} from '../../../../../../../shared-library/src/asset/assets/coin/interfaces';
import {getTimeRanges} from '../../../../../../../shared-library/src/functions/time/get-time-ranges';


describe('Test query data for update coin database', function () {
    let metaInit: MetaData;
    let spyC: jasmine.Spy, spyM: jasmine.Spy, spyR: jasmine.Spy;
    const expectedCoinCalls = 1 + maxGeckoCoinPageSize;
    const expectedMarketCalls = Math.ceil(assetCoin.getIds().length / maxGeckoMarketCoinPerPage);

    beforeEach(async function () {
        const content = createCoinHistoryStorageSeed(assetCoin.getIds());
        disableGeckoTimeSleep();
        spyM = spyOnGeckoMarketsAndReturnForIds();
        spyR = spyOnGeckoRangeAndReturnResponse();
        metaInit = createDummyMetaData(10000000);
        useFirestoreMock();
        useCloudStorageMock();
        await writeCoinHistoryCompact(metaInit, content);
        await writeCoinBuffer(metaInit, createCoinHistoryStorageEmpty([]));
        await writeGeckoCoinPageIndex(0);
        //disableConsoleLog();
    });

    it('should fill attributes with responses and use current timestamp for meta data', async function () {
        spyC = spyOnGeckoCoinAndReturnResponse();
        const randomTimestamp = Math.random() * 123450;
        spyOn(Date, 'now').and.returnValue(randomTimestamp);
        // act
        const result = await queryData();
        // assert
        const storedHistory = await readCoinHistoryBucket();
        const storedBuffer = await readCoinBufferBucket();
        const sampledIds = Object.keys(result.samples);
        expect(result.history).toEqual(storedHistory.payload);
        expect(result.buffer).toEqual(storedBuffer.payload);
        expect(sampledIds).toEqual(assetCoin.getIds());
        expect(result.meta.timestampMs).toEqual(randomTimestamp);
        expect(result.meta.ratesTo$).not.toEqual(metaInit.ratesTo$);
        expect(spyC).toHaveBeenCalledTimes(expectedCoinCalls);
        expect(spyM).toHaveBeenCalledTimes(expectedMarketCalls);
        expect(spyR).toHaveBeenCalledTimes(0);
    });

    it('should load history from gecko for missing coin if read history is not complete', async function () {
        spyC = spyOnGeckoCoinAndReturnResponse();
        const ids = assetCoin.getIds();
        const missingId = ids.pop() as AssetIdCoin;
        const content = createCoinHistoryStorageSeed(ids);
        const meta = createDummyMetaData(12345);
        await writeCoinHistoryCompact(meta, content);
        // act
        const result = await queryData();
        // assert
        const storedHistory = await readCoinHistoryBucket();
        expect(storedHistory.payload[missingId]).toBeUndefined();
        expect(result.history[missingId]).toBeDefined();
        expect(spyC).toHaveBeenCalledTimes(expectedCoinCalls);
        expect(spyM).toHaveBeenCalledTimes(expectedMarketCalls);
        expect(spyR).toHaveBeenCalledTimes(getTimeRanges().length);
    });

    it('should use exchange rates and unit for meta data from buffer if gecko fetch coin failed', async function () {
        spyOnGeckoCoinAndReturnError();
        const randomTimestamp = Math.random() * 123450;
        spyOn(Date, 'now').and.returnValue(randomTimestamp);
        // act
        const result = await queryData();
        // assert
        expect(result.meta.timestampMs).toEqual(randomTimestamp);
        expect(result.meta.timestampMs).not.toEqual(metaInit.timestampMs);
        expect(result.meta.unit).toEqual(metaInit.unit);
        expect(result.meta.ratesTo$).toEqual(metaInit.ratesTo$);
    });
});
