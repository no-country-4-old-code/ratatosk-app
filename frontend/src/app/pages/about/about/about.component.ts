import {ChangeDetectionStrategy, Component} from '@angular/core';
import {imagePaths} from '@app/lib/global/images';
import {appInfo} from '@app/lib/global/app-info';
import {
    ActionListElementInputs
} from '@shared_comp/list-element/list-element-icon-and-text/list-element-icon-and-text.component';
import {isPublicRelease} from '@shared_library/settings/firebase-projects';


@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-about',
    templateUrl: './about.component.html',
    styleUrls: ['./about.component.scss']
})
export class AboutComponent {
    readonly pageTitle = 'about';
    readonly appInfo = appInfo;
    readonly iconPath = imagePaths.appSmall;
    readonly postVersionInfo = isPublicRelease ? '' : ' - develop';
    readonly whatWeDo = 'We give you <b>superpowers !</b>' +
        '\n\nWith us you analyse more than 500+ cryptocurrencies in a blink of time.';
    readonly whoWeAre = "Ratatosk GmbH is a small startup located in Berlin (Germany)." +
        "\n\nWe develop solutions to analyse, monitor and control large amounts of data effectively." +
        `\n\nIf you have any questions, do not hesitate to contact us via ${appInfo.emailContact}.`;

    readonly itemsConnect: ActionListElementInputs[] = [
        {
            icon: imagePaths.twitter,
            title: 'Follow us on twitter',
            callback: () => this.openExternalUrl(appInfo.twitterAccountUrl)
        },
    ];
    readonly itemsThank: ActionListElementInputs[] = [
        {
            icon: imagePaths.coin_gecko,
            title: 'CoinGecko',
            callback: () => this.openExternalUrl('https://www.coingecko.com/en')
        },
        {
            icon: imagePaths.crypto_compare,
            title: 'CryptoCompare',
            callback: () => this.openExternalUrl('https://www.cryptocompare.com/')
        }
    ];

    openExternalUrl(url: string): void {
        (window as any).open(url, '_blank');
    }

    logVersion(): void {
        console.log('Click on header', appInfo.version);
    }
}
