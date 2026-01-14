import {Component, EventEmitter, Input, OnInit, Output, TemplateRef} from '@angular/core';
import {EMPTY, merge, Observable, Subject} from 'rxjs';
import {distinctUntilChanged, map, scan, shareReplay, skip, startWith} from 'rxjs/operators';
import {EventEmitterMixin} from '@app/lib/components/mixin-event-emiter';

export type SwipeDirection = 'left' | 'right'
export type SlideRestriction = 'none' | 'toggle'
export type SlideTemplateIndex = 0 | 1 ;

export interface Swipe {
	indexNextTemplate: SlideTemplateIndex;
	direction: SwipeDirection;
}

export interface TemplateInfo {
	template: TemplateRef<any>;
	animationClass: string;
}

@Component({
	selector: 'app-slide',
	templateUrl: './slide.component.html',
	styleUrls: ['./slide.component.scss']
})
export class SlideComponent extends EventEmitterMixin implements OnInit {
	@Input() template0: TemplateRef<any>;
	@Input() template1: TemplateRef<any>;
	@Input() swipeTrigger$: Observable<SwipeDirection> = EMPTY;
	@Input() slideRestriction: SlideRestriction = 'none';
	@Output() swipeEvent = new EventEmitter<Swipe>();
	templateStreams$: Observable<Observable<TemplateInfo>[]>;
	private readonly firstTemplateIdx: SlideTemplateIndex = 1;

	private readonly swipeSubject = new Subject<SwipeDirection>();
	private readonly lookupAnimationEnter: { [swipeDirection in SwipeDirection]: string } = {
		'left': 'x-animate-slide-in-right',
		'right': 'x-animate-slide-in-left',
	};
	private readonly lookupAnimationExit: { [swipeDirection in SwipeDirection]: string } = {
		'left': 'x-animate-slide-out-left',
		'right': 'x-animate-slide-out-right',
	};

	ngOnInit() {
		const swipeDirection$ = this.getSwipeDirection$();
		const swipe$ = this.getSwipe$(swipeDirection$);
		this.templateStreams$ = this.getTemplateStreams$(swipe$);
		this.mapStream2Event(swipe$, this.swipeEvent);
	}

	onSwipeCards(event): void {
		if (event.deltaX > 0) {
			this.swipeSubject.next('right');
		} else {
			this.swipeSubject.next('left');
		}
	}

// private

	private getSwipeDirection$(): Observable<SwipeDirection> {
		const internal$ = this.swipeSubject.asObservable();
		let swipe$ = merge(internal$, this.swipeTrigger$);
		if (this.slideRestriction === 'toggle') {
			swipe$ = this.getRestrictedSwipeDirections$(swipe$);
		}
		return swipe$;
	}

	private getSwipe$(swipeDirection$: Observable<SwipeDirection>): Observable<Swipe> {
		const seed: Swipe = {indexNextTemplate: this.firstTemplateIdx, direction: undefined};
		const idx0: SlideTemplateIndex = 0;
		const idx1: SlideTemplateIndex = 1;
		return swipeDirection$.pipe(
			scan((oldSwipe, direction) => {
				const idx = (oldSwipe.indexNextTemplate === 0) ? idx1 : idx0;
				return {direction, indexNextTemplate: idx};
			}, seed),
			shareReplay(1)
		);
	}

	private getTemplateStreams$(swipe$: Observable<Swipe>) {
		const temp0 = this.getTemplate$(swipe$, 0, this.template0);
		const temp1 = this.getTemplate$(swipe$, 1, this.template1);
		return swipe$.pipe(
			map(swipe => swipe.indexNextTemplate),
			startWith(this.firstTemplateIdx),
			// swap because otherwise the last element overlays the first and prevent it from click events -.-.
			// sure there is a more elegant way to use it (somehow in css)
			map(idx => (idx === 0) ? [temp1, temp0] : [temp0, temp1])
		);
	}

	private getTemplate$(swipe$: Observable<Swipe>, ownIdx: SlideTemplateIndex, template: TemplateRef<any>): Observable<TemplateInfo> {
		const seed: TemplateInfo = {template, animationClass: undefined};
		return swipe$.pipe(
			scan((currentTemp, swipe) => {
				const isShown = swipe.indexNextTemplate === ownIdx;
				return this.createTemplateInfo(swipe, isShown, template);
			}, seed),
			startWith(this.getInit(ownIdx === this.firstTemplateIdx, template)));
	}

	private getRestrictedSwipeDirections$(swipe$: Observable<SwipeDirection>): Observable<SwipeDirection> {
		// preload swipe to prevent going "right" from start
		const init: SwipeDirection = 'right';
		return swipe$.pipe(
			startWith(init),
			distinctUntilChanged(),
			skip(1));
	}

	private getInit(hasToEnterScreen: boolean, template: TemplateRef<any>): TemplateInfo {
		return hasToEnterScreen ? {template, animationClass: ''} : {template, animationClass: 'hidden-element'};
	}

	private createTemplateInfo(swipe: Swipe, isShown: boolean, template: TemplateRef<any>) {
		const lookupAnimation = (isShown) ? this.lookupAnimationEnter : this.lookupAnimationExit;
		return {template, animationClass: lookupAnimation[swipe.direction]};
	}

}
