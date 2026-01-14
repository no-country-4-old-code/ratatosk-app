import {createArray} from '../../../../../../../shared-library/src/functions/general/array';
import {
    Params,
    ScopeInMin
} from '../../../../../../../shared-library/src/scan/indicator-functions/params/interfaces-params';
import {
    createDummyScanAlwaysFalse,
    createDummyScanAlwaysTrue,
    createEmptyScan,
} from '../../../../../../../shared-library/src/functions/test-utils/dummy-data/scan';
import {
    createDummyConditionSpecific
} from '../../../../../../../shared-library/src/functions/test-utils/dummy-data/condition';
import {runScan} from '../../../../src/functions/scan/helper/run-scans';
import {MetricHistory} from '../../../../../../../shared-library/src/datatypes/data';
import {assetCoin} from '../../../../../../../shared-library/src/asset/lookup-asset-factory';


describe('Test if scan condition functions are correctly build and applied', function () {
    const metric: MetricHistory<'coin'> = 'price';
    const coinsSimplePrice = [
        assetCoin.createDummyPartialFilledHistoryWithId('id0', metric, [10]),
        assetCoin.createDummyPartialFilledHistoryWithId('id1', metric, [20]),
        assetCoin.createDummyPartialFilledHistoryWithId('id2', metric, [30])
    ];

    describe('Test conditions pure', function () {

        it('should return all coin IDs if conditions is always full filled', function () {
            const scan = createDummyScanAlwaysTrue();
            const coinIds = runScan(scan, coinsSimplePrice);
            expect(coinIds.length).toEqual(3);
            expect(coinIds).toEqual(['id0', 'id1', 'id2']);
        });

        it('should return no coin IDs if conditions is never full filled', function () {
            const scan = createDummyScanAlwaysFalse();
            const coinIds = runScan(scan, coinsSimplePrice);
            expect(coinIds.length).toEqual(0);
        });
    });

    describe('Test conditions average', function () {
        const scope: ScopeInMin = 60;
        const numOfSamples = 12;
        const paramsPure: Params = {factor: 1};
        const paramsAverage: Params = {scope, factor: 1};
        const scanAverageRight = createEmptyScan();
        scanAverageRight.conditions = [createDummyConditionSpecific('value', paramsPure, '>', 'average', paramsAverage)];

        it('should return all coin IDs if conditions is always full filled', function () {
            const coins = [
                assetCoin.createDummyPartialFilledHistoryWithId('id0', metric, [...createArray(numOfSamples - 1, 10), 9]),
                assetCoin.createDummyPartialFilledHistoryWithId('id1', metric, [...createArray(numOfSamples - 1, 15), 14]),
                assetCoin.createDummyPartialFilledHistoryWithId('id2', metric, [...createArray(numOfSamples - 1, 20), 19])
            ];
            const coinIds = runScan(scanAverageRight, coins);
            expect(coinIds.length).toEqual(3);
            expect(coinIds).toEqual(['id0', 'id1', 'id2']);
        });

        it('should return no coin IDs if conditions is never full filled', function () {
            const coins = [
                assetCoin.createDummyPartialFilledHistoryWithId('id0', metric, createArray(10, numOfSamples)),
                assetCoin.createDummyPartialFilledHistoryWithId('id1', metric, createArray(15, numOfSamples * 2)),
                assetCoin.createDummyPartialFilledHistoryWithId('id2', metric, createArray(20, numOfSamples / 2))
            ];
            const coinIds = runScan(scanAverageRight, coins);
            expect(coinIds.length).toEqual(0);
        });

        it('should only consider first n sample', function () {
            const coins = assetCoin.createDummyPartialFilledHistoryWithId('id0', metric, [...createArray(numOfSamples - 1, 20), 19, 1000]);
            const coinIds = runScan(scanAverageRight, [coins]);
            expect(coinIds).toEqual(['id0']);
        });
    });

});



