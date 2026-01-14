import {DocumentationComponent} from '@app/pages/how-to/documentation/documentation.component';
import {buildAllMocks, MockControlArray} from '@test/helper-frontend/mocks/all';
import {expectMarbles, marbleRun} from '@test/helper-frontend/marble/functions.spec';
import {documentationFunctions} from '@app/pages/how-to/documentation/docs-functions';
import {documentationMetrics} from '@app/pages/how-to/documentation/docs-metrics';
import {documentationOther} from '@app/pages/how-to/documentation/docs-other';
import {MarbleLookup} from '@test/helper-frontend/marble/lookup';
import {cold} from 'jasmine-marbles';
import {map} from 'rxjs/operators';
import {DocumentationMultiple} from '@app/pages/how-to/_components/interfaces';

describe('Test get started documentation component', function () {
    const lookContent: MarbleLookup<DocumentationMultiple<any>> = {
        f: documentationFunctions,
        a: documentationMetrics,
        o: documentationOther
    };
    const lookupParamTitle: MarbleLookup<string> = {
        f: lookContent.f.header,
        a: lookContent.a.header,
        o: lookContent.o.header,
        u: 'fo-bar123'
    };
    let component: DocumentationComponent;
    let mocks: MockControlArray;
    let spyRouter;


    beforeEach(function () {
        mocks = buildAllMocks();
        component = new DocumentationComponent(mocks.location.mock, mocks.route.mock, mocks.router.mock);
        spyRouter = spyOn(mocks.router.mock, 'navigate');
    });

    it('should load content according to route', () => marbleRun(env => {
        const paramMap$ = cold('f-a-o-o-a-f', lookupParamTitle);
        const expected$ = cold('f-a-o-o-a-f', lookContent);
        mocks.route.control.paramMap$ = paramMap$.pipe(map(param => ({get: (tmp) => param})));
        expectMarbles(component.doc$, expected$, env);
    }));

    it('should load error page if route is invalid', () => marbleRun(env => {
        const paramMap$ = cold('u-', lookupParamTitle);
        mocks.route.control.paramMap$ = paramMap$.pipe(map(param => ({get: (tmp) => param})));
        component.doc$.subscribe();
        env.flush();
        expect(spyRouter).toHaveBeenCalledTimes(1);
        expect(spyRouter).toHaveBeenCalledWith(['/error']);
    }));

    it('should not load error page if route is valid', () => marbleRun(env => {
        const paramMap$ = cold('f-', lookupParamTitle);
        mocks.route.control.paramMap$ = paramMap$.pipe(map(param => ({get: (tmp) => param})));
        component.doc$.subscribe();
        env.flush();
        expect(spyRouter).toHaveBeenCalledTimes(0);
    }));
});
