import {Component, Input} from '@angular/core';
import {ThemePalette} from '@angular/material/core';
import {ListElementBasicComponent} from '@shared_comp/list-element/list-element-basic/list-element-basic.component';

@Component({
	selector: 'app-list-element-icon',
	templateUrl: './list-element-icon.component.html',
	styleUrls: ['./list-element-icon.component.scss']
})
export class ListElementIconComponent extends ListElementBasicComponent {
	@Input() icon: string;
	@Input() isIconImage = false;
	@Input() iconColor: ThemePalette = undefined;
}
