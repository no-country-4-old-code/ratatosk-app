import {expectMarbles, marbleRun} from '@test/helper-frontend/marble/functions.spec';
import {createDummyScanFronted} from '@test/helper-frontend/dummy-data/view';
import {map} from 'rxjs/operators';
import {cold} from 'jasmine-marbles';
import {
    lookupMarble2Attribute,
    lookupMarble2Boolean,
    lookupMarble2CompareOption,
    lookupMarble2CurrencySymbol,
    lookupMarble2FunctionOption,
    lookupMarble2Numbers,
    lookupMarble2UserRole,
    MarbleLookup
} from '@test/helper-frontend/marble/lookup';
import {
    ConditionManagerComponent
} from '@app/pages/build-scan/_components/condition-manager/condition-manager.component';
import {buildAllMocks, MockControlArray} from '@test/helper-frontend/mocks/all';
import {Observable} from 'rxjs';
import {SelectorExtended} from '@app/pages/build-scan/_components/condition-modify/selectors';
import {SetterBlueprint} from '@app/lib/components/abstract-setter';
import {Params} from '../../../../../../shared-library/src/scan/indicator-functions/params/interfaces-params';
import {createDummyUserData} from '../../../../../../shared-library/src/functions/test-utils/dummy-data/user';
import {UserData} from '../../../../../../shared-library/src/datatypes/user';
import {MetricCoinHistory} from '../../../../../../shared-library/src/asset/assets/coin/interfaces';
import {maxNumberOfConditions, maxNumberOfConditionsForUser} from '../../../../../../shared-library/src/scan/settings';
import {FunctionOption} from '../../../../../../shared-library/src/scan/indicator-functions/interfaces';
import {CompareOption, ConditionBlueprint} from '../../../../../../shared-library/src/scan/condition/interfaces';


xdescribe('ConditionManagerComponent', () => {
    let mocks: MockControlArray;
    let component: ConditionManagerComponent;

    function createConditions(n: number): ConditionBlueprint<'coin'>[] {
        return createDummyScanFronted(n).conditions;
    }

    function actAddRmv<T>(stream$: Observable<T>, add$, rmv$, expected$, env: any): void {
        add$.subscribe(trig => component.addCondition());
        rmv$.subscribe(trig => component.rmvCondition(0));
        env.expectObservable(stream$).toBe(expected$.marbles, expected$.values);
    }

    beforeEach(function () {
        mocks = buildAllMocks();
        component = new ConditionManagerComponent(mocks.role.mock, mocks.user.mock);
    });

    describe('Test selected index', function () {

        function act(expected$, env) {
            component.ngOnInit();
            env.expectObservable(component.selectedIdx$).toBe(expected$.marbles, expected$.values);
        }

        it('should return index of 0 if no conditions are given', () => marbleRun(env => {
            component.initialConditions = [];
            const expected$ = cold('a--', lookupMarble2Numbers);
            act(expected$, env);
        }));

        it('should update index with click on condition && range protect of idx && only on change', () => marbleRun(env => {
            component.initialConditions = createConditions(2);
            const idx$ = env.hot('--a-b-b-a--b-c-', lookupMarble2Numbers);
            const expected$ = cold('a---b---a--b-a-', lookupMarble2Numbers);
            idx$.subscribe(idx => component.selectCondition(idx));
            act(expected$, env);
        }));

        it('should update index on change of conditions to be always in range', () => marbleRun(env => {
            component.initialConditions = createConditions(3);
            const add$ = env.hot('--------a-a-a----');
            const rmv$ = env.hot('----r-r-------r-r');
            const idx$ = env.hot('--b---------------', lookupMarble2Numbers);
            const expected$ = cold('a-b---a-b---------', lookupMarble2Numbers);
            idx$.subscribe(idx => component.selectCondition(idx));
            component.ngOnInit();
            actAddRmv(component.selectedIdx$, add$, rmv$, expected$, env);
        }));

        it('should emit event if selected idx changed', () => marbleRun(env => {
            // one test to show that stream2event works
            component.initialConditions = createConditions(2);
            const idx$ = env.hot('--a-b-b-c', lookupMarble2Numbers);
            const expected$ = cold('----b---a', lookupMarble2Numbers);
            component.ngOnInit();
            const event$ = component.selectedIdxChanged.asObservable();
            idx$.subscribe(idx => component.selectCondition(idx));
            component.selectedIdx$.subscribe();
            env.expectObservable(event$).toBe(expected$.marbles, expected$.values);
        }));
    });

    describe('Test selected condition', function () {
        const lookupFactor: MarbleLookup<number> = {a: 123.4538942841, b: 423};

        beforeEach(function () {
            component.initialConditions = createConditions(3);
            component.initialConditions[0].left.params.factor = lookupFactor.a;
            component.initialConditions[1].left.params.factor = lookupFactor.b;
        });

        function act(expected$, env) {
            component.ngOnInit();
            const factor$ = component.selectedCondition$.pipe(map(cond => cond.left.params.factor));
            env.expectObservable(factor$).toBe(expected$.marbles, expected$.values);
        }

        it('should return undefined if no conditions are given', () => marbleRun(env => {
            component.initialConditions = [];
            const expected$ = cold('a--', {a: undefined});
            component.ngOnInit();
            env.expectObservable(component.selectedCondition$).toBe(expected$.marbles, expected$.values);
        }));

        it('should start with first condition on default', () => marbleRun(env => {
            const expected$ = cold('a--', lookupFactor);
            act(expected$, env);
        }));

        it('should update selected condition according to selected idx', () => marbleRun(env => {
            const idx$ = env.hot('a-b-b-a', lookupMarble2Numbers);
            const expected$ = cold('a-b---a', lookupFactor);
            idx$.subscribe(idx => component.selectCondition(idx));
            act(expected$, env);
        }));
    });

    describe('Test condition stream', function () {
        const views = [createDummyScanFronted(1), createDummyScanFronted(1), createDummyScanFronted(2)];
        let conditionsLength$;

        beforeEach(function () {
            component.initialConditions = createConditions(0);
            component.ngOnInit();
            conditionsLength$ = component.conditions$.pipe(map(conditions => conditions.length));
            views[1].title = 'ChangedTitle-' + views[0].title;
        });

        it('should add and rmv new conditions ', () => marbleRun(env => {
            const add$ = env.hot('--a-a-a-------a--');
            const rmv$ = env.hot('--------r-r-r---r');
            const expected$ = cold('a-b-c-d-c-b-a-b-a', lookupMarble2Numbers);
            actAddRmv(conditionsLength$, add$, rmv$, expected$, env);
        }));

        it('should be stable if trying to remove more then existing ', () => marbleRun(env => {
            const add$ = env.hot('------a--');
            const rmv$ = env.hot('--r-r---r');
            const expected$ = cold('a-a-a-b-a', lookupMarble2Numbers);
            actAddRmv(conditionsLength$, add$, rmv$, expected$, env);
        }));
    });

    describe('Test stream of restriction reason for add condition action', function () {

        function act(add$, rmv$, expected$, env: any): void {
            component.ngOnInit();
            const isRestricted$: Observable<boolean> = component.restrictionReason$.pipe(
                map(reason => reason.length > 0));
            actAddRmv(isRestricted$, add$, rmv$, expected$, env);
        }

        it(`should restrict adding condition for DEMO user (limit is ${maxNumberOfConditionsForUser})`, () => marbleRun(env => {
            component.initialConditions = createConditions(maxNumberOfConditionsForUser);
            mocks.role.control.role$ = cold('d----', lookupMarble2UserRole);
            const add$ = env.hot('----a');
            const rmv$ = env.hot('--r--');
            const expected$ = cold('t-f-t', lookupMarble2Boolean);
            act(add$, rmv$, expected$, env);
        }));

        it(`should restrict adding condition for USER user (limit is ${maxNumberOfConditionsForUser})`, () => marbleRun(env => {
            component.initialConditions = createConditions(maxNumberOfConditionsForUser);
            mocks.role.control.role$ = cold('u----', lookupMarble2UserRole);
            const add$ = env.hot('----a');
            const rmv$ = env.hot('--r--');
            const expected$ = cold('t-f-t', lookupMarble2Boolean);
            act(add$, rmv$, expected$, env);
        }));

        it(`should restrict adding condition for PRO user by maximum limit ${maxNumberOfConditions}`, () => marbleRun(env => {
            component.initialConditions = createConditions(maxNumberOfConditions);
            mocks.role.control.role$ = cold('p----', lookupMarble2UserRole);
            const add$ = env.hot('----a');
            const rmv$ = env.hot('--r--');
            const expected$ = cold('t-f-t', lookupMarble2Boolean);
            act(add$, rmv$, expected$, env);
        }));

        it('should update restrictions based on role', () => marbleRun(env => {
            component.initialConditions = createConditions(maxNumberOfConditionsForUser);
            mocks.role.control.role$ = cold('u-p---u-d', lookupMarble2UserRole);
            const add$ = env.hot(           '---------');
            const rmv$ = env.hot(           '----r----');
            const expected$ = cold(         't-f------', lookupMarble2Boolean);
            act(add$, rmv$, expected$, env);
        }));
    });

    describe('Test setter', function () {
        let setter: SetterBlueprint<Params>;

        beforeEach(function () {
            component.initialConditions = createConditions(3);
            component.initialConditions[0].left.params.factor = lookupMarble2Numbers.a;
            component.initialConditions[1].left.params.factor = lookupMarble2Numbers.b;
            component.initialConditions[2].left.params.factor = lookupMarble2Numbers.b;
            component.ngOnInit();
            setter = component.setterFunctionParams;
        });

        it('should update displayed params on change of selected condition', () => marbleRun(env => {
            const idx$ = env.hot('a-b-b-c-a', lookupMarble2Numbers);
            const expected$ = cold('a-b-----a', lookupMarble2Numbers);
            const factor$ = setter.settings$.pipe(map(params => params.factor));
            idx$.subscribe(idx => component.selectCondition(idx));
            env.expectObservable(factor$).toBe(expected$.marbles, expected$.values);
        }));

        it('should update params of selected condition using callback function', () => marbleRun(env => {
            const update$ = env.hot('--b-b-a', lookupMarble2Numbers);
            const expected$ = cold('a-b-b-a', lookupMarble2Numbers);
            const stream$ = component.selectedCondition$.pipe(map(condition => condition.left.params.factor));
            update$.subscribe(factor => setter.onChangeCallback({factor}));
            env.expectObservable(stream$).toBe(expected$.marbles, expected$.values);
        }));

        it('should ignore if selected condition is undefined (case of no conditions)', () => marbleRun(env => {
            component.initialConditions = [];
            component.ngOnInit();
            setter = component.setterFunctionParams;
            const add$ = env.hot('--a---a-a');
            const rmv$ = env.hot('----r----');
            const expected$ = cold('--a------', {a: 1});
            const factor$ = setter.settings$.pipe(map(params => params.factor));
            actAddRmv(factor$, add$, rmv$, expected$, env);
        }));
    });

    describe('Test displayed unit', function () {
        const lookupUserData: MarbleLookup<UserData> = {
            d: {...createDummyUserData(), settings: {currency: 'usd'}},
            e: {...createDummyUserData(), settings: {currency: 'eur'}},
        };

        beforeEach(function () {
            component.initialConditions = createConditions(3);
            component.initialConditions[0].metric = lookupMarble2Attribute.p;
            component.initialConditions[1].metric = lookupMarble2Attribute.v;
            component.initialConditions[2].metric = lookupMarble2Attribute.r;
            component.ngOnInit();
        });

        function act(idx$, user$, expected$, env) {
            mocks.user.control.user$ = user$;
            idx$.subscribe(idx => component.selectCondition(idx));
            expectMarbles(component.unitSymbol$, expected$, env);
        }

        it('should update unit on change of attribute of selected condition', () => marbleRun(env => {
            const idx$ = env.hot('a-b-c-c-b', lookupMarble2Numbers);
            const user$ = cold('d--------', lookupUserData);
            const expected$ = cold('d---r---d', lookupMarble2CurrencySymbol);
            act(idx$, user$, expected$, env);
        }));

        it('should update unit on change of currency', () => marbleRun(env => {
            const idx$ = env.hot('a-------', lookupMarble2Numbers);
            const user$ = cold('d-e-e-d-', lookupUserData);
            const expected$ = cold('d-e---d-', lookupMarble2CurrencySymbol);
            act(idx$, user$, expected$, env);
        }));
    });

    describe('Test selectors', function () {
        function initWithEmptyConditions() {
            component.initialConditions = [];
            component.ngOnInit();
        }

        function getUnpackedSelected$(selector: SelectorExtended<any>) {
            return selector.selected$.pipe(map(array => array[0]));
        }

        function subscribeToCallback(selector: SelectorExtended<any>, update$) {
            update$.subscribe(attr => selector.onSelectionCallback([attr]));
        }

        beforeEach(function () {
            component.initialConditions = createConditions(3);
        });

        describe('Test selector compare', function () {
            let selector: SelectorExtended<CompareOption>;

            beforeEach(function () {
                component.initialConditions[0].compare = lookupMarble2CompareOption.g;
                component.initialConditions[1].compare = lookupMarble2CompareOption.l;
                component.initialConditions[2].compare = lookupMarble2CompareOption.l;
                component.ngOnInit();
                selector = component.selectorCompare;
            });

            it('should update selected compare option on change of selected condition', () => marbleRun(env => {
                const idx$ = env.hot('a-b-b-c-a', lookupMarble2Numbers);
                const expected$ = cold('g-l-----g', lookupMarble2CompareOption);
                const stream$ = getUnpackedSelected$(selector);
                idx$.subscribe(idx => component.selectCondition(idx));
                env.expectObservable(stream$).toBe(expected$.marbles, expected$.values);
            }));

            it('should update compare option of selected condition using callback function', () => marbleRun(env => {
                const update$ = env.hot('--l-l-g', lookupMarble2CompareOption);
                const expected$ = cold('g-l-l-g', lookupMarble2CompareOption);
                const stream$ = component.selectedCondition$.pipe(map(condition => condition.compare));
                subscribeToCallback(selector, update$);
                env.expectObservable(stream$).toBe(expected$.marbles, expected$.values);
            }));

            it('should ignore if selected condition is undefined (case of no conditions)', () => marbleRun(env => {
                initWithEmptyConditions();
                selector = component.selectorCompare;
                const add$ = env.hot('--a---a-a');
                const rmv$ = env.hot('----r----');
                const expected$ = cold('--e------', lookupMarble2CompareOption);
                const stream$ = getUnpackedSelected$(selector);
                actAddRmv(stream$, add$, rmv$, expected$, env);
            }));
        });

        describe('Test selector attribute', function () {
            let selector: SelectorExtended<MetricCoinHistory>;

            beforeEach(function () {
                component.initialConditions[0].metric = lookupMarble2Attribute.p;
                component.initialConditions[1].metric = lookupMarble2Attribute.r;
                component.initialConditions[2].metric = lookupMarble2Attribute.r;
                component.ngOnInit();
                selector = component.selectorAttribute;
            });

            it('should update selected attribute on change of attribute of selected condition', () => marbleRun(env => {
                const idx$ = env.hot('a-b-b-c-a', lookupMarble2Numbers);
                const expected$ = cold('p-r-----p', lookupMarble2Attribute);
                const stream$ = getUnpackedSelected$(selector);
                idx$.subscribe(idx => component.selectCondition(idx));
                env.expectObservable(stream$).toBe(expected$.marbles, expected$.values);
            }));

            it('should update attribute of selected condition using callback function', () => marbleRun(env => {
                const update$ = env.hot('--r-r-s-p', lookupMarble2Attribute);
                const expected$ = cold('p-r-r-s-p', lookupMarble2Attribute);
                const stream$ = component.selectedCondition$.pipe(map(condition => condition.metric));
                subscribeToCallback(selector, update$);
                env.expectObservable(stream$).toBe(expected$.marbles, expected$.values);
            }));

            it('should ignore if selected condition is undefined (case of no conditions)', () => marbleRun(env => {
                initWithEmptyConditions();
                selector = component.selectorAttribute;
                const add$ = env.hot('--a---a-a');
                const rmv$ = env.hot('----r----');
                const expected$ = cold('--p------', lookupMarble2Attribute);
                const stream$ = getUnpackedSelected$(selector);
                actAddRmv(stream$, add$, rmv$, expected$, env);
            }));

            it('should always update both attributes of selected condition', () => marbleRun(env => {
                const collected = [];
                const update$ = env.hot('--r-s-p', lookupMarble2Attribute);
                update$.subscribe(attr => selector.onSelectionCallback([attr]));
                component.selectedCondition$.subscribe(condition => {
                    collected.push(condition.metric);
                });
                env.flush();
                expect(collected).toEqual(['p', 'r', 's', 'p'].map(marble => lookupMarble2Attribute[marble]));
            }));
        });

        describe('Test selector function option', function () {
            let selector: SelectorExtended<FunctionOption>;

            beforeEach(function () {
                component.initialConditions[0].left.func = lookupMarble2FunctionOption.p;
                component.initialConditions[1].left.func = lookupMarble2FunctionOption.a;
                component.initialConditions[2].left.func = lookupMarble2FunctionOption.a;
                component.ngOnInit();
                selector = component.selectorFunctionLeft;
            });

            it('should update selected function option on change of selected condition', () => marbleRun(env => {
                const idx$ = env.hot('a-b-b-c-a', lookupMarble2Numbers);
                const expected$ = cold('p-a-----p', lookupMarble2FunctionOption);
                const stream$ = getUnpackedSelected$(selector);
                idx$.subscribe(idx => component.selectCondition(idx));
                env.expectObservable(stream$).toBe(expected$.marbles, expected$.values);
            }));

            it('should update function option of selected condition using callback function', () => marbleRun(env => {
                const update$ = env.hot('--a-a-p', lookupMarble2FunctionOption);
                const expected$ = cold('p-a-a-p', lookupMarble2FunctionOption);
                const stream$ = component.selectedCondition$.pipe(map(condition => condition.left.func));
                subscribeToCallback(selector, update$);
                env.expectObservable(stream$).toBe(expected$.marbles, expected$.values);
            }));

            it('should ignore if selected condition is undefined (case of no conditions)', () => marbleRun(env => {
                initWithEmptyConditions();
                selector = component.selectorFunctionLeft;
                const add$ = env.hot('--a---a-a');
                const rmv$ = env.hot('----r----');
                const expected$ = cold('--p------', lookupMarble2FunctionOption);
                const stream$ = getUnpackedSelected$(selector);
                actAddRmv(stream$, add$, rmv$, expected$, env);
            }));
        });
    });

});
