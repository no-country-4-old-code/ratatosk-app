import {FunctionBlueprint} from '../indicator-functions/interfaces';
import {History, MetricHistory} from '../../datatypes/data';
import {AssetType} from '../../asset/interfaces-asset';

export type CompareOption = '<' | '>' | '<=' | '>=';

export interface ConditionBlueprint<ASSET_TYPE extends AssetType> {
    left: FunctionBlueprint;
    right: FunctionBlueprint;
    compare: CompareOption;
    metric: MetricHistory<ASSET_TYPE>;
}

export type ConditionFunction<ASSET_TYPE extends AssetType> = (history: History<ASSET_TYPE>) => boolean;
