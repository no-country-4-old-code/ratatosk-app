import {ChangeDetectionStrategy, Component} from '@angular/core';
import {materialIcons} from '@app/lib/global/icons';
import {Location} from '@angular/common';
import {appInfo} from '@lib/global/app-info';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-terms-and-conditions',
    templateUrl: './terms-and-condtions.component.html',
    styleUrls: ['./terms-and-condtions.component.scss']
})
export class TermsAndCondtionsComponent {
    readonly title = 'Terms & Conditions';
    readonly iconBack = materialIcons.back;
    readonly email = appInfo.emailContact;
    readonly appName = appInfo.name;
    readonly appUrl = appInfo.url;

    constructor(public location: Location) {}
}
