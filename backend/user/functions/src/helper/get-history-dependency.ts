import {MetricCoinHistory} from '../../../../../shared-library/src/asset/assets/coin/interfaces';
import {Scan} from '../../../../../shared-library/src/scan/interfaces';
import {getSetOfElements} from '../../../../../shared-library/src/functions/general/array';
import {AssetType} from '../../../../../shared-library/src/asset/interfaces-asset';

export type CloudStorageHistoryPathInfo = { metric: MetricCoinHistory; asset: AssetType };


export function getHistoryDependencyOfScans(blueprints: Scan[]): CloudStorageHistoryPathInfo[] {
    const metrics = blueprints.flatMap(bp => {
        return bp.conditions.map(condition => ({metric: condition.metric, asset: bp.asset}));
    });
    return getSetOfElements(metrics);
}
