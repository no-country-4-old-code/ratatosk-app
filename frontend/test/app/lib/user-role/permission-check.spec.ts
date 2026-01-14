import {lookupPermission} from '@app/lib/user-role/permission-check/lookupPermissionCheck';
import {
    PermissionCheckInput,
    PermissionCheckResult,
    RestrictedAction,
    UserRole
} from '@app/lib/user-role/permission-check/interfaces';

describe('Test user role permission checks', function () {
    const nonDemoRoles: UserRole[] = ['user', 'pro'];
    const limitNumberOfConditionsUser = 3;
    let input: PermissionCheckInput;

    beforeEach(function () {
        input = {
            numberOfScanBlueprints: 0,
            numberOfConditionsOfScan: 0
        };
    });

    function checkLimit(limit: number, callWithNumber: (n: number) => PermissionCheckResult) {
        expect(callWithNumber(limit - 1).isPermitted).toBeTruthy();
        expect(callWithNumber(limit).isPermitted).toBeFalsy();
        expect(callWithNumber(limit + 1).isPermitted).toBeFalsy();
        expect(callWithNumber(limit).reason.length).toBeGreaterThan(0);
    }

    function checkLimitCondition(limit: number, role: UserRole, action: RestrictedAction) {
        const func = lookupPermission[action][role];
        const callWithNumber = (n: number) => func({...input, ...{numberOfConditionsOfScan: n}});
        checkLimit(limit, callWithNumber);
    }

    describe('Test add and modify scan', function () {
        const limitUser = 3;
        const limitPro = 9;

        function checkLimitScan(numberOfScans: number, role: UserRole, action: RestrictedAction) {
            const func = lookupPermission[action][role];
            const callWithNumber = (n: number) => func({...input, ...{numberOfScanBlueprints: n}});
            checkLimit(numberOfScans, callWithNumber);
        }

        it(`should restrict adding scans if maximum number of scans is reached ${limitUser} (user)`, function () {
            checkLimitScan(limitUser, 'user', 'addScan');
        });

        it(`should restrict adding scans if maximum number of conditions per scan is exceeded ${limitNumberOfConditionsUser} (user)`, function () {
            checkLimitCondition(limitNumberOfConditionsUser + 1, 'user', 'addScan');
        });

        it(`should restrict adding scans if maximum number of scans is reached ${limitPro} (pro)`, function () {
            checkLimitScan(limitPro, 'pro', 'addScan');
        });

        it(`should restrict modifying scans if maximum number of scans is exceeded ${limitUser} (user)`, function () {
            checkLimitScan(limitUser + 1, 'user', 'modifyScan');
        });

        it(`should restrict modifying scans if maximum number of conditions per scan is exceeded ${limitNumberOfConditionsUser} (user)`, function () {
            checkLimitCondition(limitNumberOfConditionsUser + 1, 'user', 'modifyScan');
        });

        it(`should restrict modifying scans if maximum number of scans is exceeded ${limitPro} (pro)`, function () {
            checkLimitScan(limitPro + 1, 'pro', 'modifyScan');
        });
    });

    describe('Test add conditions', function () {
        const action: RestrictedAction = 'addCondition';

        it(`should restrict adding conditions if maximum number of conditions per scan is reached ${limitNumberOfConditionsUser} (user)`, function () {
            checkLimitCondition(limitNumberOfConditionsUser, 'user', 'addCondition');
        });

        it('should allow everything for pro (limit is given by build scan plausibility checks)', function () {
            const func = lookupPermission[action]['pro'];
            const result = func({...input, ...{numberOfScanBlueprints: 1000}});
            expect(result.isPermitted).toBeTruthy();
        });
    });

    describe('Test delete scan', function () {

        it('should allow deletion of scan for all except demo', function () {
            nonDemoRoles.forEach(role => {
                const result = lookupPermission['deleteScan'][role]();
                expect(result.isPermitted).toBeTruthy();
                expect(result.reason.length).toEqual(0);
            });
        });
    });

    describe('Test show paid options', function () {

        it('should not allow user to see paid options', () => {
            const result = lookupPermission.showAllOptions.user();
            expect(result.isPermitted).toBeFalsy();
            expect(result.reason.length).toBeGreaterThan(0);
        });

        it('should allow pro to see paid options', () => {
            const result = lookupPermission.showAllOptions.pro();
            expect(result.isPermitted).toBeTruthy();
            expect(result.reason.length).toEqual(0);
        });
    });


    describe('General checks', function () {
        function getAllActions(): RestrictedAction[] {
            const actionObj: { [action in RestrictedAction]: string } = {
                addScan: '', modifyScan: '', deleteScan: '', addCondition: '', showAllOptions: '', saveUserData: ''
            };
            return Object.keys(actionObj) as RestrictedAction[];
        }

        it('should allow permission for user, pro in case of default (except paid options)', function () {
            const actions = getAllActions().filter(action => action !== 'showAllOptions');
            nonDemoRoles.forEach(role => {
                actions.forEach(action => {
                    const result = lookupPermission[action][role](input);
                    expect(result.isPermitted).toBeTruthy();
                    expect(result.reason.length).toEqual(0);
                });
            });
        });

        it('should not allow demo anything because limits could be bypassed easily (except adding condition & show options)', function () {
            getAllActions()
                .filter(action => action !== 'addCondition')
                .filter(action => action !== 'showAllOptions')
                .forEach(action => {
                    const result = lookupPermission[action]['demo'](input);
                    expect(result.isPermitted).toBeFalsy();
                    expect(result.reason.length).toBeGreaterThan(0);
            });
        });
    });
});
