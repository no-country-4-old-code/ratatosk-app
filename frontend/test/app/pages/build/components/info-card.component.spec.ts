import {marbleRun} from '@test/helper-frontend/marble/functions.spec';
import {InfoCardComponent} from '@app/pages/build-scan/_components/card-info/info-card.component';
import {cold} from 'jasmine-marbles';
import {lookupMarble2Numbers, MarbleLookup} from '@test/helper-frontend/marble/lookup';
import {SlideTemplateIndex, SwipeDirection} from '@shared_comp/slide/slide.component';
import {map, mapTo, pluck} from 'rxjs/operators';


describe('InfoCardComponent', () => {
    const lookupErrorOrInfo: MarbleLookup<string[]> = {a: ['a'], b: ['a', 'b'], c: ['a', 'b', 'c'], d: []};
    const lookupSwipeDirection: MarbleLookup<SwipeDirection> = {l: 'left', r: 'right'};
    let component: InfoCardComponent;

    function triggerSwipe(direction: SwipeDirection, indexNextTemplate: SlideTemplateIndex): void {
        component.onSwipe({direction, indexNextTemplate});
    }

    beforeEach(function () {
        component = new InfoCardComponent();
    });

    describe('Test card update', function () {

        it('should trigger a swipe to left if input streams are changing', () => marbleRun(env => {
            component.errors$ = env.hot('d--a-b-b-a--d--------------', lookupErrorOrInfo);
            component.importantInfos$ = env.hot('d--------------a-b-b-a--a--', lookupErrorOrInfo);
            const expected$ = cold('---l-l---l--l--l-l---l-----', lookupSwipeDirection);
            component.ngOnInit();
            env.expectObservable(component.swipeTrigger$).toBe(expected$.marbles, expected$.values);
        }));

        it('should update card 1 at the beginning (even if there was no swipe)', () => marbleRun(env => {
            component.ngOnInit();
            env.expectObservable(component.cardStreams[0].pipe(mapTo('a'))).toBe('--');
            env.expectObservable(component.cardStreams[1].pipe(mapTo('a'))).toBe('a-');
        }));

        xit('should prioritise error before spec. info before common info', () => marbleRun(env => {
            const lookupText = {a: ['error'], b: ['infoSpecial'], c: ['info'], d: []};
            const error$ = cold(      'd---a---d----a--', lookupText);
            const infoSpecial$ = cold('d-b---b---d----b', lookupText);
            const expected$ = cold(   '--b-a---b----a--', lookupText);
            const selected$ = component['selectCards$'](error$, infoSpecial$).pipe(map(card => [card[0].content]));
            env.expectObservable(selected$).toBe(expected$.marbles, expected$.values);
        }));

    });

    describe('Test swipe', function () {

        it('should change text to right / left according to swipe event', () => marbleRun(env => {
            let toggle = 0;
            component.errors$ = env.hot('c---------------------', lookupErrorOrInfo);
            const swipe$ = env.hot('--l-l-l-l-r-r-r-r-l-r', lookupSwipeDirection);
            const expectedCard0$ = '----c---b---c---a---a';
            const expectedCard1$ = 'a-b---a---a---b---b--';
            component.ngOnInit();
            swipe$.subscribe(direction => {
                toggle++;
                triggerSwipe(direction, (toggle % 2) as SlideTemplateIndex);
            });
            env.expectObservable(component.cardStreams[0].pipe(pluck('content'))).toBe(expectedCard0$);
            env.expectObservable(component.cardStreams[1].pipe(pluck('content'))).toBe(expectedCard1$);
        }));

        it('should update template according to swipe "next template" index', () => marbleRun(env => {
            component.errors$ = env.hot('a------------', lookupErrorOrInfo);
            const swipeIdx$ = env.hot('--a-b-b-a-a-b', lookupMarble2Numbers);
            const expectedCard0$ = '--a-----a-a--';
            const expectedCard1$ = 'a---a-a-----a';
            component.ngOnInit();
            swipeIdx$.subscribe(idx => triggerSwipe('left', idx as SlideTemplateIndex));
            env.expectObservable(component.cardStreams[0].pipe(mapTo('a'))).toBe(expectedCard0$);
            env.expectObservable(component.cardStreams[1].pipe(mapTo('a'))).toBe(expectedCard1$);
        }));
    });

});
