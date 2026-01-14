import {AssetIdCoin, MetricCoinHistory} from '../../../../../../shared-library/src/asset/assets/coin/interfaces';
import {getFunctionOptions} from '../../../../../../shared-library/src/scan/indicator-functions/lookup-functions';
import {assetCoin} from '../../../../../../shared-library/src/asset/lookup-asset-factory';
import {FunctionOption} from '../../../../../../shared-library/src/scan/indicator-functions/interfaces';
/*
A pro-user could select all options (full-options).
A non-pro-user could only select a subset (free-options).
! If a normal user already has a "paid" option configured, he can keep this configuration and will not get any info/ error/ etc
	(he still not see this option in the selection dialog)
*/

export const freeOptionsFunction: FunctionOption[] = getFunctionOptions();
export const allOptionsFunction: FunctionOption[] = getFunctionOptions();

export const freeOptionsMetric: MetricCoinHistory[] = ['price', 'rank', 'supply', 'volume', 'marketCap'];
export const allOptionsMetric: MetricCoinHistory[] = assetCoin.getMetricsHistory();

// this refer only to selectable example coin ids (the normal user could still see every coin in the chart result etc)
export const freeOptionsCoinIds: AssetIdCoin[] = ['bitcoin', 'ethereum', 'dogecoin'];
export const allOptionsCoinIds: AssetIdCoin[] = assetCoin.getIds();
