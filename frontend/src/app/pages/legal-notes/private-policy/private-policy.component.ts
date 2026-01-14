import {ChangeDetectionStrategy, Component} from '@angular/core';
import {materialIcons} from '@app/lib/global/icons';
import {Location} from '@angular/common';
import {appInfo} from '@lib/global/app-info';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-private-policy',
    templateUrl: './private-policy.component.html',
    styleUrls: ['./private-policy.component.scss']
})
export class PrivatePolicyComponent {
    readonly title = 'private policy';
    readonly iconBack = materialIcons.back;
    readonly email = appInfo.emailContact;
    readonly appName = appInfo.name;
    readonly appUrl = appInfo.url;

    constructor(public location: Location) {
    }
}
