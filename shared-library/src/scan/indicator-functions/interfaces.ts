import {ParamOption, Params} from './params/interfaces-params';
import {TimeSteps} from '../../datatypes/time';

export interface FunctionBlueprint {
    func: FunctionOption;
    params: Params;
}

export interface FunctionInfo {
    name: FunctionOption;
    supportedParams: ParamOption[];
}

export interface FunctionFactory {
    build: (params: Params) => IndicatorFunction;
    getInfo: () => FunctionInfo;
}

export type FunctionOption =
    | 'threshold'
    | 'value'
    | 'average'
    | 'pastValue'
    | 'max'
    | 'min'
    | 'deviation';

export type IndicatorFunction = (steps: TimeSteps) => number;