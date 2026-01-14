import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {materialIcons} from '@app/lib/global/icons';
import {BasicBarComponent} from '@shared_comp/app-bar/basic-bar/basic-bar.component';
import {Location} from '@angular/common';

@Component({
	changeDetection: ChangeDetectionStrategy.OnPush,
	selector: 'app-bar-return',
	templateUrl: './app-bar-return.component.html',
	styleUrls: ['./app-bar-return.component.scss']
})
export class AppBarReturnComponent extends BasicBarComponent {
	@Input() title = '';
	@Input() iconLeft = materialIcons.back;
	@Input() disableMenu = false;

	constructor(private location: Location) {
		super();
	}

	onClick(clickedElement: string) {
		if (clickedElement === this.iconLeft) {
			this.location.back();
		} else {
			if (clickedElement !== '') {
				this.clickOnGivenElement.emit(clickedElement);
			}
		}
	}
}
