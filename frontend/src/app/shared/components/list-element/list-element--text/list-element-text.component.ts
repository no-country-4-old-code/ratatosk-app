import {Component, Input} from '@angular/core';


import {ListElementBasicComponent} from '@shared_comp/list-element/list-element-basic/list-element-basic.component';


@Component({
	selector: 'app-list-element-text',
	templateUrl: './list-element-text.component.html',
	styleUrls: ['./list-element-text.component.scss']
})
export class ListElementTextComponent extends ListElementBasicComponent {
	empty = '';
	@Input() title: string;
	@Input() subtext = this.empty;
	@Input() titleClass = 'font-body2';
	@Input() subtextClass = 'font-caption-colored';
	@Input() isHeightRestricted = false;
}
