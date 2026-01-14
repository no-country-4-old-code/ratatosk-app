import {buildAllMocks, MockControlArray} from '@test/helper-frontend/mocks/all';
import {marbleRun} from '@test/helper-frontend/marble/functions.spec';
import {
    DialogSelectOneAssetComponent
} from '@app/pages/build-scan/_components/dialog-select-one-asset/dialog-select-one-asset.component';
import {MarbleLookup} from '@test/helper-frontend/marble/lookup';
import {PermissionCheckResult} from '@app/lib/user-role/permission-check/interfaces';
import {lookupCoinInfo} from '../../../../../../shared-library/src/asset/assets/coin/helper/lookup-coin-info-basic';
import {of} from 'rxjs';
import {cold} from 'jasmine-marbles';
import {assetCoin} from '../../../../../../shared-library/src/asset/lookup-asset-factory';
import {AssetIdCoin} from '../../../../../../shared-library/src/asset/assets/coin/interfaces';
import {take} from 'rxjs/operators';
import {freeOptionsCoinIds} from '@lib/user-role/options/options';

describe('DialogSelectOneCoinComponent', function () {
    let component: DialogSelectOneAssetComponent;
    let mocks: MockControlArray;

    beforeEach(function () {
        mocks = buildAllMocks();
        const permission: PermissionCheckResult = {isPermitted: true, reason: ''};
        mocks.role.control.permission$ = of(permission);
        component = new DialogSelectOneAssetComponent(mocks.role.mock);
    });

    describe('Test stream of coin ids', function () {
        const lookup: MarbleLookup<AssetIdCoin[]> = {a: ['id0'], c: ['id2'], e: [], x: assetCoin.getIds()};
        const lookupSearchTermBasic: MarbleLookup<string> = {e: 'xyz1029Miau', x: ''};

        function act(lookupSearchTerm, env) {
            const filter$ = env.hot('--a-c-c-a-e-x', {...lookupSearchTerm, ...lookupSearchTermBasic});
            const expected$ = cold( 'x-a-c---a-e-x', lookup);
            filter$.subscribe(term => component.onSearchTermUpdate(term));
            env.expectObservable(component.coinIds$).toBe(expected$.marbles, expected$.values);
        }

        it('should filter coin ids by name', () => marbleRun(env => {
            const lookupSearchTerm: MarbleLookup<string> = {
                a: lookupCoinInfo['id0'].name,
                c: lookupCoinInfo['id2'].name
            };
            act(lookupSearchTerm, env);
        }));

        it('should filter coin ids by symbol', () => marbleRun(env => {
            const lookupSearchTerm: MarbleLookup<string> = {
                a: lookupCoinInfo['id0'].symbol,
                c: lookupCoinInfo['id2'].symbol
            };
            act(lookupSearchTerm, env);
        }));

        it('should return some coins even if no permission', () => marbleRun(env => {
            const permission: PermissionCheckResult = {isPermitted: false, reason: 'nope'};
            let callCount = 0;
            mocks.role.control.permission$ = of(permission);
            component.coinIds$.pipe(
                take(1)
            ).subscribe(ids => {
                callCount++;
                expect(ids).toEqual(freeOptionsCoinIds);
            });
            env.flush();
            expect(callCount).toEqual(1);
        }));
    });

});
