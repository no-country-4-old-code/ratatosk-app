import {Component, Input} from '@angular/core';

import {ListElementIconComponent} from '@shared_comp/list-element/list-element-icon/list-element-icon.component';

export interface ActionListElementInputs {
	title: string;
	icon: string;
	callback: () => void;
	subtext?: string;
}

@Component({
	selector: 'app-list-element-icon-and-text',
	templateUrl: './list-element-icon-and-text.component.html',
	styleUrls: ['./list-element-icon-and-text.component.scss']
})
export class ListElementIconAndTextComponent extends ListElementIconComponent {
	empty = '';
	@Input() title: string;
	@Input() subtext = this.empty;
	@Input() titleClass = 'font-body2';
	@Input() subtextClass = 'font-caption-colored';
}
