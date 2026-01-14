import {ChangeDetectionStrategy, Component} from '@angular/core';
import {appInfo} from '@app/lib/global/app-info';
import {Observable} from 'rxjs';
import {UserService} from '@app/services/user.service';
import {distinctUntilChanged, map, switchMap} from 'rxjs/operators';
import {requestCancelProVersion} from '@app/lib/backend-api/cancel-pro-version';
import {AuthService} from '@app/services/auth.service';
import {HttpClient} from '@angular/common/http';
import {MatDialog} from '@angular/material/dialog';
import {imagePaths} from '@lib/global/images';
import {openDialogLoading} from '@shared_comp/dialog-loading/dialog-loading.component';
import {onlyFirstEmitWillPass} from '@lib/rxjs/only-first-emit-will-pass';

interface Info {
    title: string;
    subtext: string;
}

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-context-pro',
    templateUrl: './context-pro.component.html',
    styleUrls: ['./context-pro.component.scss']
})
export class ContextProComponent {
    public readonly userBannerIconPath = imagePaths.appSmall;
    readonly isCanceled$: Observable<boolean>;
    readonly expiredInfo$: Observable<string>;
    readonly infos: Info[] = [
        {title: 'Questions ?', subtext: this.createSubtext(appInfo.tagsQuestion, appInfo.emailProSupport)},
        {title: 'Feature request ?', subtext: this.createSubtext(appInfo.tagsFeatureRequest)},
        {title: 'Bug report ?', subtext: this.createSubtext(appInfo.tagsBug, appInfo.emailProSupport)},
    ];
    readonly infoProVersionDateEnds$: Observable<string>;
    readonly infoProVersionDateExtends$: Observable<string>;

    constructor(private userService: UserService, private auth: AuthService, private http: HttpClient, private dialog: MatDialog) {
        this.isCanceled$ = this.getCanceled$();
        this.expiredInfo$ = this.getExpiredInfo$();
        this.infoProVersionDateEnds$ = this.getInfoProVersionDateEnds$();
        this.infoProVersionDateExtends$ = this.getInfoProVersionDateExtends$();
    }

    setCancelStatus(setCanceled: boolean): void {
        const cancel$ = this.auth.getTokenId$().pipe(
            onlyFirstEmitWillPass(),
            switchMap(token => requestCancelProVersion(token, setCanceled, this.http))
        );
        openDialogLoading(cancel$, this.dialog);
    }

    // private

    private getInfoProVersionDateExtends$() {
        return this.expiredInfo$.pipe(
            map(date => `Your subscription is automatically extended at ${date}`)
        );
    }

    private getInfoProVersionDateEnds$() {
        return this.expiredInfo$.pipe(
            map(date => `Your Pro account is canceled. Your subscription ends at ${date}`)
        );
    }

    private createSubtext(tag: string, email?: string): string {
        let doc = `Ask us on twitter using <b>${tag}</b>`;
        if (email !== undefined) {
            doc += ` or send us an email to <b>${email}</b>`;
        }
        return doc;
    }

    private getCanceled$() {
        return this.userService.user$.pipe(
            map(user => user.pro.hasCanceledProVersion),
            distinctUntilChanged()
        );
    }

    private getExpiredInfo$() {
        return this.userService.user$.pipe(
            map(user => user.pro.useProVersionUntil),
            map(ms => new Date(ms)),
            map(date => date.toLocaleDateString()),
            distinctUntilChanged()
        );
    }
}

