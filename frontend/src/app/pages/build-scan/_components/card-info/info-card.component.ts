import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';
import {combineLatest, merge, Observable, of, Subject} from 'rxjs';
import {distinctUntilChanged, filter, map, mapTo, scan, shareReplay, skip, startWith, tap} from 'rxjs/operators';
import {SlideTemplateIndex, Swipe, SwipeDirection} from '@shared_comp/slide/slide.component';
import {areArraysEqual} from '../../../../../../../shared-library/src/functions/general/array';
import {withLatestFromRequested} from '@app/lib/rxjs/with-latest-from-requested';
import {OnDestroyMixin} from '@app/lib/components/mixin-on-destroy';
import {materialIcons} from '@lib/global/icons';

type Category = 'info' | 'error';

interface InfoCard {
    category: Category;
    content: string;
    cardIdx: number;
    numberOfCards: number;
    icon: string;
    colorClass: string;
    animationClass: string;
}

interface CardChange {
    newCard: InfoCard;
    idxUpdatedCard: number;
}

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-info-card',
    templateUrl: './info-card.component.html',
    styleUrls: ['./info-card.component.scss']
})
export class InfoCardComponent extends OnDestroyMixin implements OnInit {
    @Input() errors$: Observable<string[]> = of([]);
    @Input() importantInfos$: Observable<string[]> = of([]);
    @Input() isPro: boolean | undefined = undefined;
    cardStreams: Observable<InfoCard>[] = [];
    swipeTrigger$: Observable<SwipeDirection>;
    private readonly subjectSwipeEvent = new Subject<Swipe>();
    private readonly subjectTriggerSwipe = new Subject<SwipeDirection>();
    private readonly lookupCategoryColorClass: { [category in Category]: string } = {
        info: 'color-card',
        error: 'color-warn-bg'
    };

    ngOnInit() {
        const cards$ = this.selectCards$(this.errors$, this.importantInfos$);
        const swipe$ = this.subjectSwipeEvent.asObservable().pipe(startWith(undefined), shareReplay(1));
        const cardChange$ = this.getDisplayedCard$(swipe$, cards$);
        this.swipeTrigger$ = this.getSwipeTrigger$(cards$);
        this.cardStreams = [this.getCard$(cardChange$, 0), this.getCard$(cardChange$, 1)];
        cards$.pipe(this.takeUntilDestroyed()).subscribe();  // make it hot
    }

    onSwipe(swipe: Swipe) {
        this.subjectSwipeEvent.next(swipe);
    }

    // private

    private selectCards$(errors$: Observable<string[]>, importantInfos$: Observable<string[]>): Observable<InfoCard[]> {
        return combineLatest(errors$, importantInfos$).pipe(
            map(([errors, impInfos]) => {
                if (errors.length > 0) {
                    return this.map2Card(errors, 'error');
                } else if (impInfos.length > 0) {
                    return this.map2Card(impInfos, 'info');
                } else {
                    return [];
                }
            }),
            distinctUntilChanged((oldArray, newArray) => areArraysEqual(oldArray, newArray)),
            shareReplay(1),
        );
    }

    private getDisplayedCard$(swipe$: Observable<Swipe>, cards$: Observable<InfoCard[]>): Observable<CardChange> {
        const idx$ = this.getIndex$(swipe$, cards$);
        return idx$.pipe(
            withLatestFromRequested(cards$),
            tap(x => console.log('displayed card 1: ', x)),
            map(([idx, cards]) => cards[idx]),
            withLatestFromRequested(swipe$),
            tap(x => console.log('displayed card 2: ', x)),
            map(([newCard, swipe]) => ({newCard, idxUpdatedCard: (swipe !== undefined) ? swipe.indexNextTemplate : 1})),
            shareReplay(1)
        );
    }

    private getIndex$(swipe$: Observable<Swipe>, cards$: Observable<InfoCard[]>): Observable<number> {
        const initIdx = 0;
        return swipe$.pipe(
            withLatestFromRequested(cards$),
            scan((currentIdx, [swipe, cards]) => this.calcNewCardIdx(swipe, cards.length, currentIdx), initIdx)
        );
    }

    private getCard$(change$: Observable<CardChange>, idx: SlideTemplateIndex): Observable<InfoCard> {
        return change$.pipe(
            scan((currentCard, control) => {
                if (idx === control.idxUpdatedCard) {
                    currentCard = {...control.newCard};
                }
                return currentCard;
            }, undefined),
            filter(card => card !== undefined),
            distinctUntilChanged(),
            tap(x => console.log('get card $', idx, x)));
    }

    private getSwipeTrigger$(cards$: Observable<InfoCard[]>) {
        const directionByCardChange: SwipeDirection = 'left';
        const triggerClick$ = this.subjectTriggerSwipe.asObservable();
        const triggerCardChange$ = cards$.pipe(skip(1), mapTo(directionByCardChange));
        return merge(triggerClick$, triggerCardChange$);
    }

    private calcNewCardIdx(swipe: Swipe, numberOfCards: number, currentIdx: number) {
        let idx = 0;
        if (swipe !== undefined && numberOfCards > 0) {
            const swipeOffset = (swipe.direction === 'left') ? 1 : -1;
            idx = currentIdx + swipeOffset;
            if (idx < 0) {
                idx = numberOfCards - 1;
            } else {
                idx = idx % numberOfCards;
            }
        }
        return idx;
    }

    private map2Card(array: string[], category: Category): InfoCard[] {
        const lookupCategoryIcon: { [key in Category]: string } = {
            info: materialIcons.info,
            error: materialIcons.error
        };
        const numberOfCards = array.length;
        return array.map((content, idx) => ({
            category, content, numberOfCards,
            cardIdx: idx,
            icon: lookupCategoryIcon[category],
            colorClass: this.lookupCategoryColorClass[category],
            animationClass: undefined
        }));
    }
}
