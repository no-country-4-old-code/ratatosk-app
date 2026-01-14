import {PermissionCheck} from '@app/lib/user-role/permission-check/interfaces';
import {createPermissionCheck} from '@app/lib/user-role/permission-check/checks/utils';

export function createPermissionCheckOptionsFalse(): PermissionCheck {
    return createPermissionCheck(getReason);
}

// private

function getReason(): string {
    return 'No access to pro version content.';
}
