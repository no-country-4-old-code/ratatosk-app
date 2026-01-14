import {marbleRun} from '@test/helper-frontend/marble/functions.spec';
import {Observable, zip} from 'rxjs';
import {map, switchMap, take} from 'rxjs/operators';
import {cold} from 'jasmine-marbles';
import {MarbleLookup} from '@test/helper-frontend/marble/lookup';
import {SlideComponent, Swipe, SwipeDirection, TemplateInfo} from '@shared_comp/slide/slide.component';
import {TemplateRef} from '@angular/core';
import {TestColdObservable} from 'jasmine-marbles/src/test-observables';

describe('SlideComponent', () => {
    const stubTemplate0 = {idx: 0} as any as TemplateRef<any>;
    const stubTemplate1 = {idx: 1} as any as TemplateRef<any>;
    const streamShowTemplate0 = [stubTemplate1, stubTemplate0];
    const streamShowTemplate1 = [stubTemplate0, stubTemplate1];
    const lookupTemplate: MarbleLookup<TemplateRef<any>[]> = {a: streamShowTemplate0, b: streamShowTemplate1};
    const lookupSwipeDirection: MarbleLookup<SwipeDirection> = {l: 'left', r: 'right'};
    let component: SlideComponent;

    function expectTemplate$(env: any, expected$: TestColdObservable): void {
        component.ngOnInit();
        const template$ = extractAttribute$<TemplateRef<any>>((info) => info.template);
        env.expectObservable(template$).toBe(expected$.marbles, expected$.values);
    }

    function extractAttribute$<T>(extractAttr: (info: TemplateInfo) => T): Observable<T[]> {
        return component.templateStreams$.pipe(
            switchMap(streams => {
                return zip(...streams).pipe(
                    take(1),
                    map(infos => infos.map(extractAttr)));
            }));
    }

    beforeEach(function () {
        component = new SlideComponent();
        component.template0 = stubTemplate0;
        component.template1 = stubTemplate1;
    });

    it('should show template 1 first', () => marbleRun(env => {
        const expected$ = cold('b-', lookupTemplate);
        expectTemplate$(env, expected$);
    }));

    describe('Test swipe', function () {

        it('should trigger swipe by calling onSwipeCards', () => marbleRun(env => {
            const trigger$ = env.hot('--l-r-r-l-l-r-l', lookupSwipeDirection);
            const expected$ = cold('b-a-b-a-b-a-b-a', lookupTemplate);
            trigger$.pipe(map(dir => component.onSwipeCards(dir))).subscribe();
            expectTemplate$(env, expected$);
        }));

        it('should trigger swipe by using trigger stream', () => marbleRun(env => {
            component.swipeTrigger$ = cold('--l-r-r-l-l-r-l', lookupSwipeDirection);
            const expected$ = cold('b-a-b-a-b-a-b-a', lookupTemplate);
            expectTemplate$(env, expected$);
        }));

        it('should work if using trigger stream and onSwipeCards-function together', () => marbleRun(env => {
            const trigger$ = env.hot('---l-l-r-r-l-r-', lookupSwipeDirection);
            component.swipeTrigger$ = cold('--l-r-r-l-l-r-l', lookupSwipeDirection);
            const expected$ = cold('b-ababababababa', lookupTemplate);
            trigger$.pipe(map(dir => component.onSwipeCards(dir))).subscribe();
            expectTemplate$(env, expected$);
        }));

        it('should work emit swipe event on every swipe', () => marbleRun(env => {
            const trigger$ = env.hot('-----r-l---r', lookupSwipeDirection);
            component.swipeTrigger$ = cold('-l-r-----l--', lookupSwipeDirection);
            trigger$.pipe(map(dir => component.onSwipeCards(dir))).subscribe();
            component.ngOnInit();
            component.templateStreams$.subscribe();
            spyOn(component.swipeEvent, 'emit');
            env.flush();
            expect(component.swipeEvent.emit).toHaveBeenCalledTimes(6);
        }));

        it('should emit swipe with correct data', () => marbleRun(env => {
            component.swipeTrigger$ = cold('-l-r-r-l', lookupSwipeDirection);
            const expected: Swipe[][] = [[{direction: 'left', indexNextTemplate: 0}], [{
                direction: 'right',
                indexNextTemplate: 1
            }],
                [{direction: 'right', indexNextTemplate: 0}], [{direction: 'left', indexNextTemplate: 1}]];
            component.ngOnInit();
            component.templateStreams$.subscribe();
            const spy = spyOn(component.swipeEvent, 'emit');
            env.flush();
            expect(spy.calls.allArgs()).toEqual(expected as any[]);
        }));
    });

    describe('Test swipe restriction', function () {

        it('should restrict swipes - toggle', () => marbleRun(env => {
            component.slideRestriction = 'toggle';
            component.swipeTrigger$ = cold('--l-r-r-l-l-r-l', lookupSwipeDirection);
            const expected$ = cold('b-a-b---a---b-a', lookupTemplate);
            expectTemplate$(env, expected$);
        }));
    });

    describe('Test animation', function () {
        const lookupAnimation: MarbleLookup<string> = {
            e: '',
            h: 'hidden-element',
            r: 'x-animate-slide-in-right',
            s: 'x-animate-slide-out-left',
            l: 'x-animate-slide-in-left',
            n: 'x-animate-slide-out-right'
        };

        it('should animate first template in list as in-coming and second as out-going', () => marbleRun(env => {
            component.swipeTrigger$ = cold('---l-l-l--r-r-r--l-r-l', lookupSwipeDirection);
            const expectedTemp0$ = cold('h--r-s-r--n-l-n--r-n-r', lookupAnimation);
            const expectedTemp1$ = cold('e--s-r-s--l-n-l--s-l-s', lookupAnimation);
            component.ngOnInit();
            const animationTemp0$ = component.templateStreams$.pipe(take(1), switchMap(streams => streams[0]), map(temp => temp.animationClass));
            const animationTemp1$ = component.templateStreams$.pipe(take(1), switchMap(streams => streams[1]), map(temp => temp.animationClass));
            env.expectObservable(animationTemp0$).toBe(expectedTemp0$.marbles, expectedTemp0$.values);
            env.expectObservable(animationTemp1$).toBe(expectedTemp1$.marbles, expectedTemp1$.values);
        }));

    });
});
