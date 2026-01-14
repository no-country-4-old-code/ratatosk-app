import {ConditionBlueprint} from '@shared_library/scan/condition/interfaces';

export function createDefaultCondition(): ConditionBlueprint<'coin'> {
    return {
        left: {
            func: 'value',
            params: {factor: 1}
        },
        right: {
            func: 'average',
            params: {factor: 1, scope: 120}
        },
        compare: '<=',
        metric: 'price'
    };
}