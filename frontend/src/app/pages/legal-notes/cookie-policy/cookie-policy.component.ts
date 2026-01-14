import {ChangeDetectionStrategy, Component} from '@angular/core';
import {materialIcons} from '@app/lib/global/icons';
import {Location} from '@angular/common';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-disclaimer',
    templateUrl: './cookie-policy.component.html',
    styleUrls: ['./cookie-policy.component.scss']
})
export class CookiePolicyComponent {
    readonly title = 'cookie policy';
    readonly iconBack = materialIcons.back;

    // TODO: ADD COOKIES of ReCapture !! See https://www.adsimple.de/datenschutzerklaerung/google-recaptcha-datenschutzerklaerung/
    constructor(public location: Location) {
    }
}
