import {PermissionCheck, PermissionCheckInput} from '@app/lib/user-role/permission-check/interfaces';

export type GetPermissionReasonFunc = (input: PermissionCheckInput) => string;
export const emptyReason = '';

export function createPermissionCheckTrue(): PermissionCheck {
    return () => ({isPermitted: true, reason: emptyReason});
}

export function createPermissionCheckFalse(reason: string): PermissionCheck {
    return () => ({isPermitted: false, reason});
}

export function createPermissionCheckFalseDemo(): PermissionCheck {
    const reason = `You are in DEMO mode.\nCreate a free user account to save and calculate your filters.\n`;
    return createPermissionCheckFalse(reason);
}

export function createPermissionCheck(getReason: GetPermissionReasonFunc): PermissionCheck {
    return (input: PermissionCheckInput) => {
        const reason = getReason(input);
        return {isPermitted: reason === emptyReason, reason};
    };
}

