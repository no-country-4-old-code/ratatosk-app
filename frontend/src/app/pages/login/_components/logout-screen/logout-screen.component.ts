import {Component, Input} from '@angular/core';
import {UserComponent} from 'ngx-auth-firebaseui';
import {materialIcons} from '@app/lib/global/icons';
import {DialogConfirmationComponent} from '@shared_comp/dialog-confirm/dialog-confirmation.component';
import {dialogWidth, updateOnDialogClose} from '@app/lib/util/dialog';
import {MatSnackBar} from '@angular/material/snack-bar';
import {MatDialog} from '@angular/material/dialog';
import {isProVersionValid} from '@app/lib/user-role/pro-version/is-pro';
import {interval, merge, Observable, Subject} from 'rxjs';
import {delay, map, take, tap, throttleTime} from 'rxjs/operators';
import {UserData} from '../../../../../../../shared-library/src/datatypes/user';
import {Router} from "@angular/router";

interface Option {
    title: string;
    icon: string;
    callback: (user: UserData) => void;
}

interface Content {
    header: string;
    options: Option[];
}


@Component({
    selector: 'app-logout-screen',
    templateUrl: './logout-screen.component.html',
    styleUrls: ['./logout-screen.component.scss']
})
export class LogoutScreenComponent extends UserComponent {
    @Input() givenUserData$: Observable<UserData>;
    @Input() givenDialog: MatDialog;
    @Input() givenSnackBar: MatSnackBar;
    @Input() router: Router;
    readonly icons = materialIcons;
    readonly pageTitle = 'Logout';
    readonly subjectReloadAuth = new Subject<number>();
    readonly reload$ = this.getReload$();
    readonly contentVerified: Content = {
        header: 'You are logged in as',
        options: [
        ]
    };
    readonly contentNotVerified: Content = {
        header: 'Please verify your email by clicking on the link we send to',
        options: [
            {title: 'Resend link', icon: materialIcons.refresh, callback: () => this.resendVerificationEmail()}
        ]
    };

    reload = () => {
        this.subjectReloadAuth.next(1);
    };

    triggerDeleteAccount(): void {
        const isProAndHasNotCancledYet$ = this.givenUserData$.pipe(
          take(1),
          map(user => this.isProAndHasNotCanceledYet(user))
        );
        isProAndHasNotCancledYet$.subscribe(isUncanceledPro => {
            if (isUncanceledPro) {
                this.showSnackbarInfoNotCanceled();
            } else {
                this.openDialogDelete();
            }
        });
    }

    // private

    private resendVerificationEmail() {
        this.auth.currentUser.then(user => user.sendEmailVerification());
    }

    private getReload$(): Observable<number> {
        // Auth is not updated after email verification (known bug in firebase).
        // To prevent user from logout / login we have to poll it via reload
        const reloadPeriodMs = 5000; // trade of between "polling burden" and "max. wait time of user"
        const reloadStartDelayMs = 10000; // user does not start with email already verificated. A start up delay would reduce the polling burden
        const numberOfReloads = 50;  // how many automatic reload should be triggered (after 5 minutes most user should have their email verified)

        const timer$ = interval(reloadPeriodMs).pipe(
            delay(reloadStartDelayMs),
            take(numberOfReloads),
            tap(info => console.log('trigger reload via timer')));

        return merge(this.subjectReloadAuth, timer$).pipe(
            throttleTime(reloadPeriodMs / 2),
            tap(info => console.log('reload')),
            tap(trig => this.auth.currentUser.then(user => user.reload()))
        );
    }

    private isProAndHasNotCanceledYet(user: UserData): boolean {
        return isProVersionValid(user) && !user.pro.hasCanceledProVersion;
    }

    private showSnackbarInfoNotCanceled() {
        const showTimeMs = 5000;
        const msg = 'Please cancel your pro version subscription before you delete this account';
        this.givenSnackBar.open(msg, 'Ok', {politeness: 'polite', duration: showTimeMs});
    }

    private openDialogDelete() {
        const dialog = 'Are you sure you want to delete your account ?\nThis action cannot be undone.';
        const dialogRef = this.givenDialog.open(DialogConfirmationComponent, {
            width: dialogWidth,
            data: {dialog: dialog}
        });
        const deleteWrapper = (doDelete: boolean) => doDelete ? this.deleteAccount().then(() => this.signOut()) : null;
        updateOnDialogClose<boolean>(dialogRef, deleteWrapper);
    }
}
