import {LookupPermissionOfAction} from '@app/lib/user-role/permission-check/interfaces';
import {
    createPermissionCheckFalseDemo,
    createPermissionCheckTrue
} from '@app/lib/user-role/permission-check/checks/utils';
import {
    createPermissionCheckAddSearch,
    createPermissionCheckModifySearch
} from '@lib/user-role/permission-check/checks/scan';
import {createPermissionCheckAddCondition} from '@app/lib/user-role/permission-check/checks/condition';
import {createPermissionCheckOptionsFalse} from '@app/lib/user-role/permission-check/checks/content';
import {
    maxNumberOfConditionsForUser,
    maxNumberOfScansForPro,
    maxNumberOfScansForUser
} from '../../../../../../shared-library/src/scan/settings';

export const lookupPermission: LookupPermissionOfAction = {
    'addScan': {
        'demo': createPermissionCheckFalseDemo(),
        'user': createPermissionCheckAddSearch(maxNumberOfScansForUser, maxNumberOfConditionsForUser, false),
        'pro': createPermissionCheckAddSearch(maxNumberOfScansForPro, Infinity, true)
    },
    'modifyScan': {
        'demo': createPermissionCheckFalseDemo(),
        'user': createPermissionCheckModifySearch(maxNumberOfScansForUser, maxNumberOfConditionsForUser, false),
        'pro': createPermissionCheckModifySearch(maxNumberOfScansForPro, Infinity, true)
    },
    'deleteScan': {
        'demo': createPermissionCheckFalseDemo(),
        'user': createPermissionCheckTrue(),
        'pro': createPermissionCheckTrue(),
    },
    'addCondition': {
        'demo': createPermissionCheckAddCondition(maxNumberOfConditionsForUser, false),
        'user': createPermissionCheckAddCondition(maxNumberOfConditionsForUser, false),
        'pro': createPermissionCheckTrue(), // total number of conditions per scan is handled by build scan plausibility checks
    },
    'showAllOptions': {
        'demo': createPermissionCheckTrue(),
        'user': createPermissionCheckOptionsFalse(),
        'pro': createPermissionCheckTrue(),
    },
    'saveUserData': {
        'demo': createPermissionCheckFalseDemo(),
        'user': createPermissionCheckTrue(),
        'pro': createPermissionCheckTrue(),
    }
};
