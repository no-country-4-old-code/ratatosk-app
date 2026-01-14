import {Params} from '../../../scan/indicator-functions/params/interfaces-params';
import {FunctionBlueprint, FunctionOption} from '../../../scan/indicator-functions/interfaces';
import {CompareOption, ConditionBlueprint} from '../../../scan/condition/interfaces';


// TODO: Refactor (or rmv)
export function createFunctionBlueprint(factor: number, func: FunctionOption, params: Params): FunctionBlueprint {
    params.factor = factor;
    return {
        func: func,
        params: params
    };
}

export function createDummyConditionAlwaysTrue(): ConditionBlueprint<'coin'> {
    const params1 = {factor: 0.5};
    const params2 = {factor: 1};
    return createDummyConditionSpecific('value', params1, '<=', 'value', params2);
}

export function createDummyConditionAlwaysFalse(): ConditionBlueprint<'coin'> {
    const params1 = {factor: 0.5};
    const params2 = {factor: 1};
    return createDummyConditionSpecific('value', params1, '>', 'value', params2);
}


export function createDummyConditionSpecific(funcFirst: FunctionOption, paramsFirst: Params, compare: CompareOption,
                                             funcSecond: FunctionOption, paramsSecond: Params): ConditionBlueprint<'coin'> {
    return {
        left: {
            func: funcFirst,
            params: paramsFirst
        },
        right: {
            func: funcSecond,
            params: paramsSecond
        },
        compare: compare,
        metric: 'price'
    };
}
