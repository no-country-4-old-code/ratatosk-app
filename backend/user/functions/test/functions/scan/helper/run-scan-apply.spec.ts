import {runScan} from '../../../../src/functions/scan/helper/run-scans';
import {createEmptyScan} from '../../../../../../../shared-library/src/functions/test-utils/dummy-data/scan';
import {
    Params,
    ScopeInMin
} from '../../../../../../../shared-library/src/scan/indicator-functions/params/interfaces-params';
import {Scan} from '../../../../../../../shared-library/src/scan/interfaces';
import {createArray} from '../../../../../../../shared-library/src/functions/general/array';
import {
    createDummyConditionAlwaysTrue,
    createDummyConditionSpecific
} from '../../../../../../../shared-library/src/functions/test-utils/dummy-data/condition';
import {MetricHistory} from '../../../../../../../shared-library/src/datatypes/data';
import {assetCoin} from '../../../../../../../shared-library/src/asset/lookup-asset-factory';
import {ConditionBlueprint} from '../../../../../../../shared-library/src/scan/condition/interfaces';


describe('Test if scan conditions are correctly applied ', function () {
    const metric: MetricHistory<'coin'> = 'price';
    const scope: ScopeInMin = 60;
    const numOfSamples = 12;
    let scan: Scan, paramsPure: Params, paramsAverage: Params;


    beforeEach(function () {
        scan = createEmptyScan();
        paramsPure = {factor: 1};
        paramsAverage = {factor: 1, scope};
    });

    describe('Selected Coins ', function () {

        it('should only apply conditions to selected coins', function () {
            scan.conditions = [createDummyConditionAlwaysTrue()];
            scan.preSelection.manual = ['id1'];
            const coins = [
                assetCoin.createDummyPartialFilledHistoryWithId('id0', metric, createArray(numOfSamples, 20)),
                assetCoin.createDummyPartialFilledHistoryWithId('id1', metric, createArray(numOfSamples, 20)),
                assetCoin.createDummyPartialFilledHistoryWithId('id2', metric, createArray(numOfSamples, 20)),
            ];
            const coinIds = runScan(scan, coins);
            expect(coinIds).toEqual(['id1']);
        });
    });

    describe('Multiple conditions ', function () {

        let condition1: ConditionBlueprint<'coin'>, condition2: ConditionBlueprint<'coin'>,
            conditionBad: ConditionBlueprint<'coin'>;
        const coins = [
            assetCoin.createDummyPartialFilledHistoryWithId('id0', metric, [10, ...createArray(numOfSamples - 1, 10)]),
            assetCoin.createDummyPartialFilledHistoryWithId('id1', metric, [11, ...createArray(numOfSamples - 1, 10)]),
            assetCoin.createDummyPartialFilledHistoryWithId('id2', metric, [20, ...createArray(numOfSamples - 1, 10)])
        ];

        beforeEach(function () {
            const paramsAvFactor = {factor: 1.5, scope};
            condition1 = createDummyConditionSpecific('value', paramsPure, '>', 'average', paramsAverage);
            condition2 = createDummyConditionSpecific('value', paramsPure, '<', 'average', paramsAvFactor);
            conditionBad = createDummyConditionSpecific('value', paramsPure, '<', 'value', paramsPure);
        });

        it('should return 2 coins if only one of the conditions is applied (condition1: ids 1 and 2)', function () {
            scan.conditions = [condition1];
            const coinIds = runScan(scan, coins);
            expect(coinIds.length).toEqual(2);
            expect(coinIds).toEqual(['id1', 'id2']);
        });

        it('should return 2 coins if only one of the conditions is applied (condition2: ids 0 and 1)', function () {
            scan.conditions = [condition2];
            const coinIds = runScan(scan, coins);
            expect(coinIds.length).toEqual(2);
            expect(coinIds).toEqual(['id0', 'id1']);
        });

        it('should return only coin 1 when both conditions applied', function () {
            scan.conditions = [condition1, condition2];
            const coinIds = runScan(scan, coins);
            expect(coinIds.length).toEqual(1);
            expect(coinIds).toEqual(['id1']);
        });

        it('should return no coin when one of the conditions failed all', function () {
            scan.conditions = [conditionBad, condition2];
            const coinIds = runScan(scan, coins);
            expect(coinIds.length).toEqual(0);
            expect(coinIds).toEqual([]);
        });
    });

    describe('Insufficient data length ', function () {

        it('should not select id if length of needed data is not sufficient ', function () {
            paramsAverage.scope = scope;
            scan.conditions = [
                createDummyConditionSpecific('value', paramsPure, '>=', 'average', paramsAverage)];
            const coins = [
                assetCoin.createDummyPartialFilledHistoryWithId('id0', metric, createArray(numOfSamples + 1, 20)),
                assetCoin.createDummyPartialFilledHistoryWithId('id1', metric, createArray(numOfSamples, 20)),
                assetCoin.createDummyPartialFilledHistoryWithId('id2', metric, createArray(numOfSamples - 1, 20)),
                assetCoin.createDummyPartialFilledHistoryWithId('id42', metric, []),
                assetCoin.createDummyPartialFilledHistoryWithId('id53', metric, createArray(numOfSamples + 2, 20)),
            ];
            const coinIds = runScan(scan, coins);
            expect(coinIds).toEqual(['id0', 'id1', 'id53']);
        });
    });
});



