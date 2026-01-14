import {PermissionCheck, PermissionCheckInput} from '@app/lib/user-role/permission-check/interfaces';
import {createPermissionCheck, GetPermissionReasonFunc} from '@app/lib/user-role/permission-check/checks/utils';


type SearchBlueprintOperation = 'added' | 'modified';


export function createPermissionCheckAddSearch(limitOfSearchBlueprints: number, limitOfConditions: number, isPro: boolean): PermissionCheck {
    const getReason = buildGetReasonFunc(limitOfSearchBlueprints, limitOfConditions, isPro, 'added');
    return createPermissionCheck(getReason);
}

export function createPermissionCheckModifySearch(limitOfSearchBlueprints: number, limitOfConditions: number, isPro: boolean): PermissionCheck {
    const getReason = buildGetReasonFunc(limitOfSearchBlueprints, limitOfConditions, isPro, 'modified');
    return createPermissionCheck(getReason);
}

// private

function buildGetReasonFunc(limitOfScans: number, limitOfConditions: number, isPro: boolean, operation: SearchBlueprintOperation): GetPermissionReasonFunc {
    return (input: PermissionCheckInput) => {
        const isLimitReached = input.numberOfScanBlueprints == limitOfScans && operation === 'added'; // only for added
        const isLimitExceeded = input.numberOfScanBlueprints > limitOfScans;
        const isNumberOfConditionsExceeded = input.numberOfConditionsOfScan > limitOfConditions;
        let msg = '';

        if (isLimitReached || isLimitExceeded || isNumberOfConditionsExceeded) {
            if (isLimitReached) {
                msg += `Adding a new filter would exceed the allowed number of scans. ( Your limit is ${limitOfScans} ).\n`;
            }
            if (isLimitExceeded) {
                msg += `Allowed number of filters is exceeded by ${input.numberOfScanBlueprints - limitOfScans}.\n`;
            }
            if (isNumberOfConditionsExceeded) {
                msg += `Allowed number of conditions is exceeded by ${input.numberOfConditionsOfScan - limitOfConditions}.\n`;
            }
            msg += `No scans could be ${operation}.`;
        }
        return msg;
    };
}
