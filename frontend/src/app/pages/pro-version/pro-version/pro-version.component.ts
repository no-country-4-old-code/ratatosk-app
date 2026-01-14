import {ChangeDetectionStrategy, Component} from '@angular/core';
import {UserRoleService} from '@app/services/user-role.service';
import {UserRole} from '@app/lib/user-role/permission-check/interfaces';
import {imagePaths} from "@lib/global/images";
import {materialIcons} from "@lib/global/icons";
import {Feedback} from "@shared_library/settings/feedback";
import {combineLatest, Observable} from "rxjs";
import {
    maxNumberOfConditions,
    maxNumberOfScansForPro,
    searchEvaluationIntervalInMinutes
} from "@shared_library/scan/settings";
import {allOptionsMetric, freeOptionsMetric} from "@lib/user-role/options/options";
import {appInfo} from "@lib/global/app-info";
import {UserService} from "@app/services/user.service";
import {AuthService} from "@app/services/auth.service";
import {HttpClient} from "@angular/common/http";
import {MatDialog} from "@angular/material/dialog";
import {distinctUntilChanged, map, take} from "rxjs/operators";
import {UserData} from "@shared_library/datatypes/user";
import {DialogInfoComponent} from "@app/pages/pro-version/_components/dialog-info/dialog-info.component";
import {dialogWidth, updateOnDialogClose} from "@lib/util/dialog";

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-pro-version',
    templateUrl: './pro-version.component.html',
    styleUrls: ['./pro-version.component.scss']
})
export class ProVersionComponent {
    readonly pageTitle = 'pro version';
    public readonly userBannerIconPath = imagePaths.appSmall;
    readonly iconCheck = materialIcons.commitChange;
    readonly iconPro = materialIcons.proVersion;
    private readonly feedback = new Feedback();
    readonly durationOfProVersionInWeeks = this.feedback.getNumberOfProWeeks();
    readonly roleDemo: UserRole = 'demo';
    readonly roleUser: UserRole = 'user';
    readonly rolePro: UserRole = 'pro';
    readonly isFeedbackEnabled: boolean;
    readonly hasUserGivenFeedback$:Observable<boolean>;
    readonly expiredInfo$: Observable<string>;
    readonly benefits: string[] = [
        `Let all your filters be automatic recalculated every ${searchEvaluationIntervalInMinutes.toString().bold()} minutes in our cloud`,
        `Use up to ${maxNumberOfScansForPro.toString().bold()} filters`,
        `Boost your filters with ${(allOptionsMetric.length - freeOptionsMetric.length).toString().bold()} additional metrics`,
        `Be more specific by using up to ${maxNumberOfConditions.toString().bold()} conditions per filter`,
        `Get ${'push notifications'.bold()} when your filters detect new assets (IOS is not supported yet)`,
        `Use ${'all'.bold()} supported coins in the condition manager to get instant feedback`,
        `${'No delay'.bold()} on start-up because your filters are already calculated`,
        `Support us to build, extend and improve ${appInfo.name.toString().bold()}`,
    ];
    readonly twitterButton = {
        icon: imagePaths.twitter,
        title: `Follow us on twitter`,
        callback: () => this.openExternalUrl(appInfo.twitterAccountUrl)
    };


    constructor(private userService: UserService, private auth: AuthService, private http: HttpClient,
                private dialog: MatDialog, public userRole: UserRoleService) {
        this.hasUserGivenFeedback$ = this.getHasUserGivenFeedback$(userService.user$);
        this.isFeedbackEnabled = this.feedback.isFeedbackEnabled();
        this.expiredInfo$ = this.getExpiredInfo$();
    }

    public giveFeedback(): void {
        combineLatest(this.userService.user$, this.userRole.role$).pipe(
            take(1)
        ).subscribe(([user, role]) => {
            if (role === this.roleDemo) {
                this.openDialogYouAreDemoUser();
            } else {
                if (user.scans.length > 0) {
                    this.openDialogFeedback();
                } else {
                    this.openDialogFeedbackRequirmentsNotMeet();
                }
            }
        })
    }

    // private

    private getHasUserGivenFeedback$(user$: Observable<UserData>): Observable<boolean> {
        return user$.pipe(
            map(user => this.feedback.hasGivenFeedback(user.feedback))
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

    private openDialogFeedback(): void {
        /*
        const feedback$ = this.auth.getTokenId$().pipe(
            onlyFirstEmitWillPass(),
            switchMap(token => requestBuyProVersion(token, this.http))
        );

        openDialogLoading(feedback$, this.dialog);
        */

        const dialogRef = this.dialog.open(DialogInfoComponent, {
            width: dialogWidth,
            disableClose: false,
            data: {text: '<p>Still in progress</p><p>Coming <b>soon</b>!</p>'}}
        );
        updateOnDialogClose<boolean>(dialogRef, () => {});
    }

    private openExternalUrl(url: string): void {
        (window as any).open(url, '_blank');
    }

    private openDialogFeedbackRequirmentsNotMeet(): void {
        const dialogRef = this.dialog.open(DialogInfoComponent, {
            width: dialogWidth,
            disableClose: false,
            data: {text: 'Please create at least <b>one filter</b> before giving feedback.'}});
        updateOnDialogClose<boolean>(dialogRef, () => {});
    }

    private openDialogYouAreDemoUser(): void {
        const dialogRef = this.dialog.open(DialogInfoComponent, {
            width: dialogWidth,
            disableClose: false,
            data: {text: '<p>Sorry, you are currently in <b>DEMO mode</b>.</p><p>Create your own account before giving feedback (so we can give you your reward).</p>'}});
        updateOnDialogClose<boolean>(dialogRef, () => {});
    }
}
