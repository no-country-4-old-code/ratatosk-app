export type UserRole = 'demo' | 'user' | 'pro';
export type RestrictedAction = 'addScan' | 'modifyScan' | 'deleteScan' |
    'addCondition' | 'showAllOptions' | 'saveUserData';
export type PermissionCheck = (input?: PermissionCheckInput) => PermissionCheckResult;
export type LookupPermissionOfAction = { [action in RestrictedAction]: LookupPermissionCheck };
export type LookupPermissionCheck = { [role in UserRole]: PermissionCheck };

export interface PermissionCheckResult {
    readonly isPermitted: boolean;
    readonly reason: string;
}

export interface PermissionCheckInput {
    readonly numberOfScanBlueprints: number;
    readonly numberOfConditionsOfScan: number;
}
