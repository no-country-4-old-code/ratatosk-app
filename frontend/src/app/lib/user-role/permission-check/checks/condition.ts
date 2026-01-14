import {PermissionCheck, PermissionCheckInput} from '@app/lib/user-role/permission-check/interfaces';
import {createPermissionCheck, GetPermissionReasonFunc} from '@app/lib/user-role/permission-check/checks/utils';


export function createPermissionCheckAddCondition(limitOfConditions: number, isPro: boolean): PermissionCheck {
    const getReason = buildGetReasonFunc(limitOfConditions, isPro);
    return createPermissionCheck(getReason);
}

// private

function buildGetReasonFunc(limitOfConditions: number, isPro: boolean): GetPermissionReasonFunc {
    return (input: PermissionCheckInput) => {
        const isNumberOfConditionsReached = input.numberOfConditionsOfScan >= limitOfConditions;
        let msg = '';
        if (isNumberOfConditionsReached) {
            msg = `Maximum number of conditions per scan is reached ( ${input.numberOfConditionsOfScan} / ${limitOfConditions} )`;
        }
        return msg;
    };
}
