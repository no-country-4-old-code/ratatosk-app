import {ChangeDetectionStrategy, Component} from '@angular/core';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-context-user',
    templateUrl: './context-user.component.html',
    styleUrls: ['./context-user.component.scss']
})
export class ContextUserComponent {

}
