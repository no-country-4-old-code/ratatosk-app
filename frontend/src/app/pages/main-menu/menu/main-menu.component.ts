import {ChangeDetectionStrategy, Component} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {materialIcons} from '@app/lib/global/icons';
import {appInfo} from '@app/lib/global/app-info';
import {UserLastSelectionService} from '@app/services/user-last-selection.service';
import {getSwipedIndex} from '@lib/multiple-used/get-swiped-index';
import {BackgroundActivityService} from "@app/services/background-activity.service";

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-main-menu',
    templateUrl: './main-menu.component.html',
    styleUrls: ['./main-menu.component.scss']
})
export class MainMenuComponent {
    readonly pageTitle = appInfo.name;
    readonly icons = materialIcons;
    readonly iconAppBarOptions = this.icons.options;
    readonly maxNumberOfTabs = 2;
    readonly tabIndexSubject = this.tab.screenMainMenu.tabIndexSubject;

    constructor(private router: Router, private activeRoute: ActivatedRoute, public tab: UserLastSelectionService,
                private backgroundDaemons: BackgroundActivityService) {}

    openAppBarOptions(clickedElement: string) {
        if (clickedElement === this.iconAppBarOptions) {
            this.navigate('options');
        }
    }

    public navigate(path: string) {
        this.router.navigate([path], {relativeTo: this.activeRoute});
    }

    public swipeTabs(event): void {
        const index = this.tabIndexSubject.getValue();
        const newIndex = getSwipedIndex(event, index, this.maxNumberOfTabs - 1);
        this.tabIndexSubject.next(newIndex);
    }
}
