import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {Observable} from 'rxjs';
import {AbstractSelector} from '@app/lib/components/abstract-selector';
import {shareReplay, tap} from 'rxjs/operators';

@Component({
	changeDetection: ChangeDetectionStrategy.OnPush,
	selector: 'app-selector-horizontal',
	templateUrl: './selector-horizontal.component.html',
	styleUrls: ['./selector-horizontal.component.scss']
})
export class SelectorHorizontalComponent<T> extends AbstractSelector<T> implements OnInit {
	validOptions$: Observable<T[]>;

	ngOnInit() {
		this.validOptions$ = this.getCheckedOptions$();
	}

	onClick(option: T) {
		this.onSelection.emit([option]);
	}

	// private

	private getCheckedOptions$(): Observable<T[]> {
		return this.options$.pipe(
			tap(options => this.checkIfOptionsAreValid(options)),
			shareReplay(1)
		);
	}

	private checkIfOptionsAreValid(allElements: T[]) {
		const onlyUnique = (value, index, self) => self.indexOf(value) === index;
		const onlyDefined = (x) => x !== undefined && x !== null;
		const validElements = allElements.filter(onlyUnique).filter(onlyDefined);
		const areAllElementsValid = validElements.length === allElements.length;
		if (!areAllElementsValid) {
			console.error('@SelectorHorizontalComponent: Bad options$');
		}
	}

}
