import {buildAllMocks, MockControlArray} from '@test/helper-frontend/mocks/all';
import {expectMarbles, marbleRun} from '@test/helper-frontend/marble/functions.spec';
import {UserSettingsComponent} from '@app/pages/user-settings/user-settings/user-settings.component';
import {cold} from 'jasmine-marbles';
import {
    lookupMarble2Currency,
    lookupMarble2PermissionCheckResult,
    MarbleLookup
} from '@test/helper-frontend/marble/lookup';
import {createDummyUserData} from '../../../../../shared-library/src/functions/test-utils/dummy-data/user';
import {of} from 'rxjs';
import {Currency} from '../../../../../shared-library/src/datatypes/currency';
import {UserData, UserSettings} from '../../../../../shared-library/src/datatypes/user';

describe('UserSettingsComponent', function () {
    const lookupUserData: MarbleLookup<UserData> = {
        d: {...createDummyUserData(), settings: {currency: 'usd'}},
        e: {...createDummyUserData(), settings: {currency: 'eur'}},
    };
    let component: UserSettingsComponent;
    let mocks: MockControlArray;

    beforeEach(function () {
        mocks = buildAllMocks();
        mocks.role.control.permission$ = cold('t', lookupMarble2PermissionCheckResult);
        component = new UserSettingsComponent(mocks.dialog.mock, mocks.user.mock);
    });

    describe('Test stream of currency ', function () {

        function act(user$, expected$, env) {
            mocks.user.control.user$ = user$;
            expectMarbles(component.currency$, expected$, env);
        }

        it('should start with dollar', () => marbleRun(env => {
            const user$ = cold(     '--', lookupUserData);
            const expected$ = cold( 'd-', lookupMarble2Currency);
            act(user$, expected$, env);
        }));

        it('should change according to user data', () => marbleRun(env => {
            const user$ = cold(     '--e-d-d-e', lookupUserData);
            const expected$ = cold( 'd-e-d---e', lookupMarble2Currency);
            act(user$, expected$, env);
        }));
    });

    describe('Test currency dialog ', function () {
        let spyUpdate: jasmine.Spy;

        beforeEach(function () {
            spyUpdate = spyOn(mocks.user.mock, 'updateUserData').and.returnValue(of(true));
        });

        function act(currentUserData: UserData, newCurrency: Currency, env: any): void {
            mocks.user.control.user$ = of(currentUserData);
            mocks.dialog.control.afterClosed$ = of(newCurrency);
            component.openDialogCurrency(currentUserData.settings.currency);
            env.flush();
        }

        it('should update user data if selected currency changed', () => marbleRun(env => {
            const newSettings: UserSettings = lookupUserData.e.settings;
            const newCurreny: Currency = newSettings.currency;
            act(lookupUserData.d, newCurreny, env);
            expect(spyUpdate).toHaveBeenCalledTimes(1);
            expect(spyUpdate.calls.argsFor(0)[0]).toEqual({settings: newSettings});
        }));

        it('should not update user data if selected currency changed', () => marbleRun(env => {
            const newCurreny: Currency = lookupUserData.d.settings.currency;
            act(lookupUserData.d, newCurreny, env);
            expect(spyUpdate).toHaveBeenCalledTimes(0);
        }));


    });
});
