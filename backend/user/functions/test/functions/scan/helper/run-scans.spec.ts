import {createDummyScan} from '../../../../../../../shared-library/src/functions/test-utils/dummy-data/scan';
import {runScans} from '../../../../src/functions/scan/helper/run-scans';
import {createDummyMetaData} from '../../../../../../../shared-library/src/functions/test-utils/dummy-data/meta';
import {MetricHistory} from '../../../../../../../shared-library/src/datatypes/data';
import {assetCoin} from '../../../../../../../shared-library/src/asset/lookup-asset-factory';


describe('Test receive, calculation and response of scan content ', function () {
    const metric: MetricHistory<'coin'> = 'price';
    const scanAllCoinsSelected = createDummyScan(1.5);
    const scanNoCoinSelected = createDummyScan(0.5);

    const coinsSimplePrice = [
        assetCoin.createDummyPartialFilledHistoryWithId('id0', metric, [10]),
        assetCoin.createDummyPartialFilledHistoryWithId('id1', metric, [20]),
        assetCoin.createDummyPartialFilledHistoryWithId('id2', metric, [30])
    ];


    describe('Apply calculation to each scan ', function () {

        it('should return one list for each given scan', function () {
            const scans = [scanNoCoinSelected, scanAllCoinsSelected];
            const coinIds = runScans(scans, {coin: {payload: coinsSimplePrice, meta: createDummyMetaData()}});
            expect(coinIds.length).toEqual(scans.length);
        });
    });
});



