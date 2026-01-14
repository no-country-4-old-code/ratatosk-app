import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
	changeDetection: ChangeDetectionStrategy.OnPush,
	selector: 'app-basic-bar',
	templateUrl: './basic-bar.component.html',
	styleUrls: ['./basic-bar.component.scss']
})
export class BasicBarComponent {
	readonly empty = '';
	@Input() iconLeft = this.empty;
	@Input() iconRightFirst = this.empty;
	@Input() iconRightSecond = this.empty;
	@Input() iconTitlePath = this.empty;
	@Input() isIconTitleDisplayedOnCard = false;
	@Input() disableElevation = false;
	@Input() disableIcons = [false, false, false];
	@Output() clickOnGivenElement = new EventEmitter<string>();

	onClick(clickedIcon: string) {
		if (!this.isEmpty(clickedIcon) && this.isEnabled(clickedIcon)) {
			this.clickOnGivenElement.emit(clickedIcon);
		}
	}

	isEnabled(clickedIcon: string): boolean {
		let isEnabled = false;
		const elements = [this.iconLeft, this.iconRightFirst, this.iconRightSecond];
		const idx = elements.indexOf(clickedIcon);
		if (idx >= 0) {
			isEnabled = !this.disableIcons[idx];
		}
		return isEnabled;
	}

	isEmpty(clickedIcon: string): boolean {
		return clickedIcon === this.empty;
	}

}
