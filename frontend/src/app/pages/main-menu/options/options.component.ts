import {ChangeDetectionStrategy, Component} from '@angular/core';
import {appInfo} from '@lib/global/app-info';
import {imagePaths} from '@lib/global/images';
import {materialIcons} from '@lib/global/icons';
import {Observable} from 'rxjs';
import {ActivatedRoute, Router} from '@angular/router';
import {AuthInfo, AuthService} from '@app/services/auth.service';
import {distinctUntilChanged, map, startWith} from 'rxjs/operators';
import {
    ActionListElementInputs
} from '@shared_comp/list-element/list-element-icon-and-text/list-element-icon-and-text.component';
import {MatSnackBar} from '@angular/material/snack-bar';
import { Clipboard } from '@angular/cdk/clipboard';
import {areObjectsEqual} from '@shared_library/functions/general/object';

interface UserBanner {
    title: string;
    titleClass: string;
}

interface Option extends ActionListElementInputs {
    isVisibileToDemoUser: boolean;
}

interface ShareMsg {
    title: string;
    text: string;
    url: string;
}

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-options',
    templateUrl: './options.component.html',
    styleUrls: ['./options.component.scss']
})
export class OptionsComponent {
    public readonly userBanner$: Observable<UserBanner>;
    public readonly userBannerIconPath = imagePaths.appSmall;
    public options$: Observable<Option[]>;

    constructor(private router: Router, private activeRoute: ActivatedRoute, private auth: AuthService,
                private snackBar: MatSnackBar, private clipboard: Clipboard) {
        this.userBanner$ = this.getUserBannerContent$();
        this.options$ = this.getOptions$();
    }

    userBannerCallback = () => {
        this.navigate('login');
    };

// private

    private navigate(path: string) {
        this.router.navigate([path], {relativeTo: this.activeRoute});
    }

    private getUserBannerContent$() {
        return this.auth.authUserInfo$.pipe(
            map(auth => this.createUserBanner(auth)),
            distinctUntilChanged((obj1, obj2) => areObjectsEqual(obj1, obj2)));
    }

    private getOptions$(): Observable<Option[]> {
        const options = this.getOptions();
        return this.auth.isLoggedIn$.pipe(
            startWith(false),
            distinctUntilChanged(),
            map(isLoggedIn => {
                return options.filter(option => option.isVisibileToDemoUser || isLoggedIn);
            })
        );
    }

    private createUserBanner(resp: AuthInfo): UserBanner {
        if (resp.isDemo) {
            return this.createDemoUserBanner();
        } else {
            return this.createLoggedInBanner(resp);
        }
    }

    private createDemoUserBanner(): UserBanner {
        return {
            title: 'Login or register',
            titleClass: 'font-body2',
        };
    }

    private createLoggedInBanner(authInfo: AuthInfo): UserBanner {
        return {
            title: `\n${authInfo.email}`,
            titleClass: 'font-body2',
        };
    }

    private triggerSharingDialog() {
        if ((navigator as any).canShare) {
            this.openShareDialog()
        } else {
            this.copyToClipboard()
        }
    }


    private createShareMsg(): ShareMsg {
        return {
            title: `${appInfo.name}`,
            text: `${appInfo.shareDialog}`,
            url: `${appInfo.url}`
        };
    }


    private openShareDialog() {
        const msg = this.createShareMsg();
        return (navigator as any).share(msg)
            .then(() => console.log('Share was successful.'))
            .catch((error) => console.log('Sharing failed', error));
    }

    private copyToClipboard() {
        const infoMsg = 'The URL was copied to your clipboard.';
        this.clipboard.copy(appInfo.url);
        this.snackBar.open(infoMsg, 'Thanks', {duration: 5000});
    }

    private getOptions(): Option[] {
        return [
            {
                icon: materialIcons.tutorial,
                title: 'Get started',
                isVisibileToDemoUser: true,
                callback: () => this.navigate('howto/get-started/scans')
            },
            {
                icon: materialIcons.proVersion,
                title: 'PRO status',
                subtext: 'We reward your feedback',
                isVisibileToDemoUser: false,
                callback: () => this.navigate('pro-version')
            },
            {
                icon: materialIcons.groups,
                title: `About ${appInfo.name}`,
                isVisibileToDemoUser: true,
                callback: () => this.navigate('about')
            },
            {
                icon: materialIcons.share,
                title: 'Share with friends',
                isVisibileToDemoUser: true,
                callback: () => this.triggerSharingDialog()
            },
            {
                icon: materialIcons.settings,
                title: 'User Settings',
                isVisibileToDemoUser: false,
                callback: () => this.navigate('settings')
            },
            {
                icon: materialIcons.info,
                title: 'Docs',
                isVisibileToDemoUser: true,
                callback: () => this.navigate('howto')
            },
            {
                icon: materialIcons.info,
                title: 'Policies',
                isVisibileToDemoUser: true,
                callback: () => this.navigate('legal-notes')
            },
            {
                icon: materialIcons.info,
                title: 'Impressum',
                isVisibileToDemoUser: true,
                callback: () => this.navigate('impressum')
            }
        ];
    }
}
