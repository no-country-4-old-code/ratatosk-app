import {marbleRun} from '@test/helper-frontend/marble/functions.spec';
import {
    DialogFunctionParamsComponent
} from '@app/pages/build-scan/_components/dialog-function-params/dialog-function-params.component';
import {MarbleLookup} from '@test/helper-frontend/marble/lookup';
import {
    Params,
    ScopeInMin
} from '../../../../../../shared-library/src/scan/indicator-functions/params/interfaces-params';
import {cold} from 'jasmine-marbles';

describe('DialogFunctionParamsComponent', function () {
    const lookupParams: MarbleLookup<Params> = {
        a: {factor: 1.2, scope: 60},
        b: {factor: 1.2, scope: 120},
        c: {factor: 0.8, scope: 60}
    };
    let component: DialogFunctionParamsComponent;
    let templateTable;

    beforeEach(function () {
        component = new DialogFunctionParamsComponent({params: lookupParams.a});
        templateTable = component['getLookupTemplate'](component.params$);
    });

    describe('Test stream params', function () {
        const lookupScope: MarbleLookup<ScopeInMin> = {a: lookupParams.a.scope, b: lookupParams.b.scope};
        const lookupFactor: MarbleLookup<number> = {a: lookupParams.a.factor, c: lookupParams.c.factor};

        it('test environment should be valid', () => {
            expect(lookupScope.a).not.toEqual(lookupScope.b);
            expect(lookupFactor.a).not.toEqual(lookupFactor.c);
        });

        it('should start with init params', () => marbleRun(env => {
            const expected$ = cold('a--', lookupParams);
            env.expectObservable(component.params$).toBe(expected$.marbles, expected$.values);
        }));

        it('should update scope', () => marbleRun(env => {
            const update$ = env.hot('--b-b-a', lookupScope);
            const expected$ = cold('a-b-b-a', lookupParams);
            update$.subscribe(scope => templateTable.scope.onSelectionCallback([scope]));
            env.expectObservable(component.params$).toBe(expected$.marbles, expected$.values);
        }));

        it('should update factor', () => marbleRun(env => {
            const update$ = env.hot('--c-c-a', lookupFactor);
            const expected$ = cold('a-c-c-a', lookupParams);
            update$.subscribe(factor => templateTable.factor.onSelectionCallback([factor]));
            env.expectObservable(component.params$).toBe(expected$.marbles, expected$.values);
        }));
    });

    describe('Test stream template lookup table', function () {
        it('should start with template table', () => marbleRun(env => {
            component.ngAfterViewInit();
            component.lookupTemplate$.subscribe(lookup => {
                // check if load correctly
                lookup.factor.mapOption2String$(1).subscribe(d => expect(d).toEqual('1'));
                lookup.factor.mapOption2String$(60).subscribe(d => expect(d).toEqual('1H'));
            });
            env.flush();
        }));
    });

    describe('Test options ', function () {

        it('should not include "attribute" because it is set otherwise', () => {
            expect(component.options).toContain('factor');
        });
    });
});
