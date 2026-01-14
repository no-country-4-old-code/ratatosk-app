import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {BasicBarComponent} from '@shared_comp/app-bar/basic-bar/basic-bar.component';

@Component({
	changeDetection: ChangeDetectionStrategy.OnPush,
	selector: 'app-bar-normal',
	templateUrl: './app-bar-normal.component.html',
	styleUrls: ['./app-bar-normal.component.scss']
})
export class AppBarNormalComponent extends BasicBarComponent {
	@Input() title = '';
}
