import {ChangeDetectionStrategy, Component} from '@angular/core';
import {materialIcons} from '@lib/global/icons';
import {appInfo} from '@lib/global/app-info';

interface CompanyDetails {
    name: string;
    street: string;
    streetNr: number;
    adressExtra: string;
    plz: string;
    town: string;
    handelsregisterNr: string;
    handelsregisterName: string;
    ceo: string;
    email: string;
    umsatzsteuerIdNr: string;
    twitterAccount: string;
}

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-disclaimer',
    templateUrl: './impressum.component.html',
    styleUrls: ['./impressum.component.scss']
})
export class ImpressumComponent {
    readonly title = 'impressum';
    readonly iconBack = materialIcons.back;
    readonly linkToEu = "https://ec.europa.eu/consumers/odr/";
    readonly company: CompanyDetails = {
        name: '---',
        street: '---',
        streetNr: 42,
        adressExtra: '---',
        plz: '---',
        town: '---',
        handelsregisterNr: '---',
        handelsregisterName: '---',
        ceo: 'you',
        email: appInfo.emailContact,
        umsatzsteuerIdNr: '---',
        twitterAccount: appInfo.twitterAccountUrl
    };
}

