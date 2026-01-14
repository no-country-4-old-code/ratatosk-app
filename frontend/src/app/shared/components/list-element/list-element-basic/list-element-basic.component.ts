import {Component, Input} from '@angular/core';

@Component({
	selector: 'app-list-element-basic',
	templateUrl: './list-element-basic.component.html',
	styleUrls: ['./list-element-basic.component.scss']
})
export class ListElementBasicComponent {
	@Input() callback: () => void = this.defaultCallback;
	@Input() disableRipple = false;
	@Input() isHeightRestricted = true;

	public defaultCallback(): void {
		console.log('Click on element without defined callback');
	}
}
