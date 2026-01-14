import {ChangeDetectionStrategy, Component} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {materialIcons} from '@app/lib/global/icons';
import {appInfo} from '@app/lib/global/app-info';

interface MenuItem {
    icon: string;
    title: string;
    callback: () => void;
}

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-legal-notes-menu',
    templateUrl: './legal-notes-menu.component.html',
    styleUrls: ['./legal-notes-menu.component.scss']
})
export class LegalNotesMenuComponent {
    readonly pageTitle = 'legal notes';
    readonly appInfo = appInfo;
    readonly items: MenuItem[] = [
        {icon: materialIcons.policy, title: 'terms and conditions', callback: () => this.navigateTo('terms-and-conditions')},
        {icon: materialIcons.policy, title: 'privacy policy', callback: () => this.navigateTo('privacy-policy')},
        {icon: materialIcons.policy, title: 'cookie policy', callback: () => this.navigateTo('cookie-policy')},
        {icon: materialIcons.policy, title: 'disclaimer', callback: () => this.navigateTo('disclaimer')}
    ];

    constructor(private router: Router, private route: ActivatedRoute) {
    }

    private navigateTo(path: string): void {
        this.router.navigate([path], {relativeTo: this.route});
    }
}
