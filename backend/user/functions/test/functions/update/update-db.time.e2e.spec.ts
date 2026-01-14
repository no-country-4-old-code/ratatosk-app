import {useFirestoreMock} from '../../../../../shared-backend-library/src/test-utils/firestore-mock/use-firestore-mock';
import {updateCoinDb} from '../../../src/functions/update/coin/update-db';
import {
    disableGeckoTimeSleep,
    spyOnGeckoCoinAndReturnResponse,
    spyOnGeckoMarketsAndReturnForIds,
    spyOnGeckoRangeAndReturnResponse
} from '../../test-utils/mocks/gecko/spy-on-gecko';
import {maxGeckoMarketCoinPerPage} from '../../../src/helper/gecko/requests/request-coin-market';
import {useCloudStorageMock} from '../../test-utils/mocks/cloud-storage/use-cloud-storage-mock';
import {lookupSetDatabaseState} from '../../test-utils/database-states';
import {readNextUpdateTimestamp} from '../../../src/functions/update/coin/data/read';
import {sampleIntervalInMinutes} from '../../../../../../shared-library/src/settings/sampling';

import {firestoreApi} from '../../../../../shared-backend-library/src/firestore/lib/api';
import {writeUpdateTimestamp} from '../../../src/helper/cloud-storage/write';
import {assetCoin} from '../../../../../../shared-library/src/asset/lookup-asset-factory';
import {usePubSubMock} from '../../test-utils/mocks/pub-sub/use-pub-sub-mock';


describe('Test e2e update database timing ', function () {
    const sampleIntervalInMs = sampleIntervalInMinutes * 60 * 1000;
    const timestampMs = 10 * sampleIntervalInMs;
    const expectedMarketCalls = Math.ceil(assetCoin.getIds().length / maxGeckoMarketCoinPerPage);
    let spyMarket: jasmine.Spy;

    beforeEach(async function () {
        useFirestoreMock();
        useCloudStorageMock();
        usePubSubMock();
        await lookupSetDatabaseState['empty']();
        await writeUpdateTimestamp({timestampMs: timestampMs, timestampMsRedundant: timestampMs});
        spyOnGeckoCoinAndReturnResponse();
        spyMarket = spyOnGeckoMarketsAndReturnForIds();
        spyOnGeckoRangeAndReturnResponse();
        disableGeckoTimeSleep();
        //disableConsoleLog();
    });

    it('should update if current timestamp is later then read timestamp ', async function () {
        spyOn(firestoreApi, 'getCurrentTimestampMs').and.returnValue(timestampMs + 1);
        await updateCoinDb();
        expect(spyMarket).toHaveBeenCalledTimes(expectedMarketCalls);
    });

    it('should not update if current timestamp is earlier then read timestamp', async function () {
        spyOn(firestoreApi, 'getCurrentTimestampMs').and.returnValue(timestampMs - 1);
        await updateCoinDb();
        expect(spyMarket).toHaveBeenCalledTimes(0);
    });

    it('should update if read timestamp is corrupted (normal !== redundant)', async function () {
        spyOn(firestoreApi, 'getCurrentTimestampMs').and.returnValue(timestampMs - 1);
        await writeUpdateTimestamp({timestampMs: timestampMs, timestampMsRedundant: timestampMs + 123});
        await updateCoinDb();
        expect(spyMarket).toHaveBeenCalledTimes(expectedMarketCalls);
    });

    it('should write next timestamp in storage after successful update', async function () {
        spyOn(firestoreApi, 'getCurrentTimestampMs').and.returnValue(timestampMs + 123);
        await updateCoinDb();
        const timestamp = await readNextUpdateTimestamp();
        expect(timestamp.timestampMs).toEqual(timestampMs + sampleIntervalInMs);
        expect(timestamp.timestampMs).toEqual(timestamp.timestampMsRedundant);
    });

    it('should not write next timestamp in storage if update was skipped', async function () {
        spyOn(firestoreApi, 'getCurrentTimestampMs').and.returnValue(timestampMs - 1);
        await updateCoinDb();
        const timestamp = await readNextUpdateTimestamp();
        expect(timestamp.timestampMs).toEqual(timestampMs);
        expect(timestamp.timestampMs).toEqual(timestamp.timestampMsRedundant);
    });

    it('should not update multiple times as long time is not reached', async function () {
        const timeObj = {timestampMs: timestampMs + 1};
        spyOn(firestoreApi, 'getCurrentTimestampMs').and.callFake(() => timeObj.timestampMs);
        await updateCoinDb();
        await updateCoinDb();
        timeObj.timestampMs += sampleIntervalInMs - 10;
        await updateCoinDb();
        await updateCoinDb();
        expect(spyMarket).toHaveBeenCalledTimes(expectedMarketCalls);
    });

    it('should update multiple times if time is reached', async function () {
        const timeObj = {timestampMs: timestampMs + 1};
        spyOn(firestoreApi, 'getCurrentTimestampMs').and.callFake(() => timeObj.timestampMs);
        await updateCoinDb();
        await updateCoinDb();
        timeObj.timestampMs += sampleIntervalInMs;
        await updateCoinDb();
        await updateCoinDb();
        expect(spyMarket).toHaveBeenCalledTimes(expectedMarketCalls * 2);
    });
});
