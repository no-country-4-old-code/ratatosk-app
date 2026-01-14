import {buildAllMocks, MockControlArray} from '@test/helper-frontend/mocks/all';
import {marbleRun} from '@test/helper-frontend/marble/functions.spec';
import {
    DialogPreselectionComponent,
    DialogPreselectionData,
    DialogPreselectionOptionData
} from '@app/pages/build-scan/_components/dialog-preselection/dialog-preselection.component';
import {cold} from 'jasmine-marbles';
import {lookupMarble2Boolean, lookupMarble2CoinId, MarbleLookup} from '@test/helper-frontend/marble/lookup';
import {MatCheckboxChange} from '@angular/material/checkbox';
import {lookupCoinInfo} from '../../../../../../shared-library/src/asset/assets/coin/helper/lookup-coin-info-basic';
import {map} from 'rxjs/operators';
import {assetCoin} from '../../../../../../shared-library/src/asset/lookup-asset-factory';
import {AssetIdCoin} from '../../../../../../shared-library/src/asset/assets/coin/interfaces';
import {getCoinIds} from '@shared_library/asset/assets/coin/helper/get-ids-and-info';

describe('DialogPreselectionComponent', function () {
    const lookup: MarbleLookup<AssetIdCoin[]> = {
        a: ['id0'], c: ['id2'], d: ['id0', 'id2'], e: [], x: assetCoin.getIds()
    };
    let component: DialogPreselectionComponent;
    let mocks: MockControlArray;
    let dialogData: DialogPreselectionData;

    function createDialogData(): DialogPreselectionData {
        const optionsDataAvailable: DialogPreselectionOptionData[] = getCoinIds().map(id => {
            return {
                id,
                iconPath: lookupCoinInfo[id].iconPath,
                title: lookupCoinInfo[id].name,
                sidetext: lookupCoinInfo[id].symbol,
            };
        });
        return {
            title: `Test`,
            optionsSelected: [],
            optionsAvailable: optionsDataAvailable
        };
    }

    beforeEach(function () {
        mocks = buildAllMocks();
        dialogData = createDialogData();
    });

    function actElements(expected$, env) {
        const ids$ = component.optionsShown$.pipe(
            map(elements => elements.filter(ele => ele.checked)),
            map(elements => elements.map(ele => ele.id))
        );
        env.expectObservable(ids$, expected$).toBe(expected$.marbles, expected$.values);
    }

    describe('Test update on selection ', function () {

        beforeEach(function () {
            component = new DialogPreselectionComponent({...dialogData, optionsSelected: []});
        });

        it('should toggle checked', () => marbleRun(env => {
            const update$ = env.hot('--a-a-a-a', lookupMarble2CoinId);
            const expected$ = cold('e-a-e-a-e', lookup);
            update$.subscribe((id: AssetIdCoin) => component.updateElement(id));
            actElements(expected$, env);
        }));

        it('should support multiple checked', () => marbleRun(env => {
            const update$ = env.hot('--a-c-a-a', lookupMarble2CoinId);
            const expected$ = cold('e-a-d-c-d', lookup);
            update$.subscribe((id: AssetIdCoin) => component.updateElement(id));
            actElements(expected$, env);
        }));

        it('should select / deselect all according to checkbox change event', () => marbleRun(env => {
            const toggle$ = env.hot('--t-f-f-t', lookupMarble2Boolean);
            const expected$ = cold('e-x-e---x', lookup);
            toggle$.subscribe((checked: boolean) => component.toggleAll({checked} as MatCheckboxChange));
            actElements(expected$, env);
        }));
    });

    describe('Test filter ', function () {
        const lookupSearchTermBasic: MarbleLookup<string> = {e: 'xyz1029Miau', x: ''};

        function act(lookupSearchTerm, env) {
            const filter$ = env.hot('--a-c-c-a-e-x', {...lookupSearchTerm, ...lookupSearchTermBasic});
            const expected$ = cold('x-a-c---a-e-x', lookup);
            filter$.subscribe(term => component.onSearchTermUpdate(term));
            actElements(expected$, env);
        }

        beforeEach(function () {
            component = new DialogPreselectionComponent({...dialogData, optionsSelected: lookup.x});
        });

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
    });

    describe('Test all selected ', function () {
        it('should update on selection update', () => marbleRun(env => {
            component = new DialogPreselectionComponent({...dialogData, optionsSelected: lookup.x});
            const update$ = env.hot('--a-a--a-c-a-c', lookupMarble2CoinId);
            const expected$ = cold('t-f-t--f-----t', lookupMarble2Boolean);
            update$.subscribe((id: AssetIdCoin) => component.updateElement(id));
            env.expectObservable(component.areAllSelected$, expected$).toBe(expected$.marbles, expected$.values);
        }));

        it('should update on toggle selection', () => marbleRun(env => {
            component = new DialogPreselectionComponent({...dialogData, optionsSelected: lookup.x});
            const toggle$ = env.hot('--t-f-f-t', lookupMarble2Boolean);
            const expected$ = cold('t---f---t', lookupMarble2Boolean);
            toggle$.subscribe((checked: boolean) => component.toggleAll({checked} as MatCheckboxChange));
            env.expectObservable(component.areAllSelected$, expected$).toBe(expected$.marbles, expected$.values);
        }));
    });

    describe('Test initial selection ', function () {
        it('should select given ids (no ids)', () => marbleRun(env => {
            component = new DialogPreselectionComponent({...dialogData, optionsSelected: lookup.e});
            const expected$ = cold('e--', lookup);
            actElements(expected$, env);
        }));

        it('should select given ids (0, 2)', () => marbleRun(env => {
            component = new DialogPreselectionComponent({...dialogData, optionsSelected: lookup.d});
            const expected$ = cold('d--', lookup);
            actElements(expected$, env);
        }));
    });

    describe('Test stream shown elements - basics ', function () {

        it('should have elements for each coin id', () => marbleRun(env => {
            component = new DialogPreselectionComponent({...dialogData, optionsSelected: []});
            component.optionsShown$.subscribe(elements => {
                expect(elements.length).toBeGreaterThan(0);
                expect(elements.length).toEqual(assetCoin.getIds().length);
            });
            env.flush();
        }));
    });
});
