import {useFirestoreMock} from '../../../../../shared-backend-library/src/test-utils/firestore-mock/use-firestore-mock';

import {disableGeckoTimeSleep} from '../../test-utils/mocks/gecko/spy-on-gecko';

import {useCloudStorageMock} from '../../test-utils/mocks/cloud-storage/use-cloud-storage-mock';

import {
    createDummyConditionSpecific
} from '../../../../../../shared-library/src/functions/test-utils/dummy-data/condition';
import {writeUser} from '../../../src/helper/firestore/write';
import {createDummyUserData} from '../../../../../../shared-library/src/functions/test-utils/dummy-data/user';
import {getFunctionOptions} from '../../../../../../shared-library/src/scan/indicator-functions/lookup-functions';
import {getInfoOfFunction} from '../../../../../../shared-library/src/scan/indicator-functions/info';
import {
    ParamOption,
    Params,
    ScopeInMin
} from '../../../../../../shared-library/src/scan/indicator-functions/params/interfaces-params';
import {MetricCoinHistory} from '../../../../../../shared-library/src/asset/assets/coin/interfaces';
import {lookupIdsDatabaseState, lookupSetDatabaseState} from '../../test-utils/database-states';
import {getScopes} from '../../../../../../shared-library/src/scan/indicator-functions/params/get-params';
import {deepCopy} from '../../../../../../shared-library/src/functions/general/object';
import {lookupCoinInfo} from '../../../../../../shared-library/src/asset/assets/coin/helper/lookup-coin-info-basic';
import {
    createFakeLookupCoinInfo,
    setUpLookupCoinInfoMock
} from '../../../../../../shared-library/src/functions/test-utils/lookup-coin-info-mocker/lookup-coin-info-mocker';
import {assetCoin} from '../../../../../../shared-library/src/asset/lookup-asset-factory';
import {runAsyncScan} from '../../../src/functions/scan/run-async-scan';
import {FunctionOption} from '../../../../../../shared-library/src/scan/indicator-functions/interfaces';
import {ConditionBlueprint} from '../../../../../../shared-library/src/scan/condition/interfaces';
import {readUser} from '../../../src/helper/firestore/read';
import {AssetId} from '../../../../../../shared-library/src/datatypes/data';
import {demoUID} from '../../../../../../shared-library/src/settings/firebase-projects';


describe('Test e2e async scan calculation for different functions with all coin attributes and scopes.', function () {
    const backup = deepCopy(lookupCoinInfo);

    beforeEach(async function () {
        // start speed up - use only 3 coins to speed up test
        const fakeLookupCoinInfo = createFakeLookupCoinInfo(3);
        setUpLookupCoinInfoMock(fakeLookupCoinInfo);
        lookupIdsDatabaseState['full'] = assetCoin.getIds();
        // end speed up
        disableGeckoTimeSleep();
        useFirestoreMock();
        useCloudStorageMock();
        await lookupSetDatabaseState['full']();
    });

    afterEach(function () {
        setUpLookupCoinInfoMock(backup);
        lookupIdsDatabaseState['full'] = assetCoin.getIds();
    });

    getFunctionOptions().forEach(func => {
        describe(`If function is "${func}" calculation`, function () {
            assetCoin.getMetricsHistory().forEach(attr => {
                getScopesForFunction(func).forEach(scope => {
                    it(`should work for attribute "${attr}" with scope "${scope}" min`, async function () {
                        await setUpDemoUser(func, attr, scope);
                        await act();
                    });
                });
            });
        });
    });

    function setUpDemoUser(func: FunctionOption, attr: MetricCoinHistory, scope: ScopeInMin): Promise<void> {
        const demo = createDummyUserData(2);
        const params = getDefaultParams(func, attr, scope);
        demo.scans[0].conditions = [createConditionAlwaysFalse(func, params)];
        demo.scans[1].conditions = [createConditionAlwaysTrue(func, params)];
        return writeUser(demoUID, demo);
    }

    async function act(): Promise<void> {
        await runAsyncScan(demoUID, true);
        const userData = await readUser(demoUID);
        const ids = userData.scans.map(scan => scan.result);
        const numberOfIds = assetCoin.getIds().length;
        expect(ids[0].length === 0).toBeTruthy(createErrMsg(userData.scans[0].id, ids[0], 0));
        expect(ids[1].length === numberOfIds).toBeTruthy(createErrMsg(userData.scans[1].id, ids[1], numberOfIds));
    }

    function createConditionAlwaysTrue(func: FunctionOption, params: Partial<Params>): ConditionBlueprint<'coin'> {
        const params1 = {...params, factor: 0.5};
        const params2 = {...params, factor: 1};
        return createDummyConditionSpecific(func, params1, '<=', func, params2);
    }

    function createConditionAlwaysFalse(func: FunctionOption, params: Partial<Params>): ConditionBlueprint<'coin'> {
        const params1 = {...params, factor: 0.5};
        const params2 = {...params, factor: 1};
        return createDummyConditionSpecific(func, params1, '>', func, params2);
    }

    function getScopesForFunction(option: FunctionOption): ScopeInMin[] {
        let scopes: ScopeInMin[] = [undefined] as any[] as ScopeInMin[];
        if (isParamSupported(option, 'scope')) {
            scopes = getScopes();
        }
        return scopes;
    }

    function getDefaultParams(option: FunctionOption, attribute: MetricCoinHistory, scope: ScopeInMin): Params {
        const params: Params = {};
        if (isParamSupported(option, 'threshold')) {
            params.threshold = 1;
        }
        if (isParamSupported(option, 'weight')) {
            params.weight = 1;
        }
        if (isParamSupported(option, 'scope')) {
            params.scope = scope;
        }
        return params;
    }

    function isParamSupported(option: FunctionOption, param: ParamOption): boolean {
        const info = getInfoOfFunction(option);
        return info.supportedParams.includes(param);
    }

    function createErrMsg(scanId: number, assetIds: AssetId<any>[], expected: number): string {
        return `Received number of selected IDs for scan ${scanId} is ${assetIds.length} !== ${expected} (expected)`;
    }
});



