import {ChangeDetectionStrategy, Component, Input} from '@angular/core';

@Component({
	changeDetection: ChangeDetectionStrategy.OnPush,
	selector: 'app-colored-percent',
	templateUrl: './colored-percent.component.html'
})
export class ColoredPercentComponent {
	@Input() value: number;
	@Input() isDisplayedBlock = true;
}
