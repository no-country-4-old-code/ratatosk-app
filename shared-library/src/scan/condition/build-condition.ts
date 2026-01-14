import {ConditionBlueprint, ConditionFunction} from './interfaces';
import {lookupCompareFunction} from './lookup-compare';
import {buildIndicatorFunction} from '../indicator-functions/build';
import {History} from '../../datatypes/data';
import {AssetType} from '../../asset/interfaces-asset';


export function buildCondition<ASSET_TYPE extends AssetType>(condition: ConditionBlueprint<ASSET_TYPE>): ConditionFunction<ASSET_TYPE> {
    checkCompare(condition);
    const compareFunc = lookupCompareFunction[condition.compare];
    const valueLeftFunc = buildIndicatorFunction(condition.left);
    const valueRightFunc = buildIndicatorFunction(condition.right);
    return (history: History<ASSET_TYPE>): boolean => {
        try {
            const steps = history[condition.metric];
            return compareFunc(valueLeftFunc(steps), valueRightFunc(steps));
        } catch (e) {
            console.log('Function calculation failed for id (ok if data requirements not meet): ', e.message);
            return false;
        }
    };
}


// -------- private


function checkCompare(condition: ConditionBlueprint<any>): void {
    if (!isCompareMethodValid(condition.compare)) {
        throw new Error('Invalid compare func: ' + condition.compare);
    }
}

function isCompareMethodValid(compareMethod: string): boolean {
    return Object.getOwnPropertyNames(lookupCompareFunction).includes(compareMethod);
}
