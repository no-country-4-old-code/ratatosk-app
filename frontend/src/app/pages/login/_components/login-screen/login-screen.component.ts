import {Component, Input, OnInit} from '@angular/core';
import {AuthComponent} from 'ngx-auth-firebaseui';
import {ThemePalette} from '@angular/material/core';
import {BehaviorSubject, from, Observable, of} from 'rxjs';
import {materialIcons} from '@lib/global/icons';
import {getSwipedIndex} from '@lib/multiple-used/get-swiped-index';
import {Router} from '@angular/router';
import {MatCheckboxChange} from '@angular/material/checkbox';
import {map, mapTo, switchMap} from 'rxjs/operators';
import {requestRegisterUserForApp} from '@lib/backend-api/register-new-user';
import {openDialogLoading} from '@shared_comp/dialog-loading/dialog-loading.component';
import {MatSnackBar} from '@angular/material/snack-bar';
import {ResponseAddNewUser} from '@shared_library/backend-interface/cloud-functions/interfaces';
import {appInfo} from '@lib/global/app-info';
import 'firebase/auth';

declare var grecaptcha: any;

@Component({
    selector: 'app-login-screen',
    templateUrl: './login-screen.component.html',
    styleUrls: ['./login-screen.component.scss']
})
export class LoginScreenComponent extends AuthComponent implements OnInit {
    @Input() tabIndexSubject: BehaviorSubject<number>;
    @Input() http;
    @Input() router: Router;
    @Input() snackbar: MatSnackBar;
    readonly tabsColor: string | ThemePalette = 'primary';
    readonly tabNameLogin = 'Log in';
    readonly tabNameReset = 'Reset';
    readonly iconLogin = materialIcons.login;
    readonly linksToLegalNotes = '../../legal-notes';
    readonly linkToTerms = this.linksToLegalNotes + '/terms-and-conditions';
    readonly linkToCookie = this.linksToLegalNotes + '/cookie-policy';
    readonly linkToPolicy = this.linksToLegalNotes + '/privacy-policy';
    readonly linkToDisclaimer = this.linksToLegalNotes + '/disclaimer';
    readonly linkToImpressum = '../../impressum';
    readonly linkToMainMenu = '../../';
    maxNumberOfTabs = 2;
    private readonly defaultUserName = 'user'; // no user name needed but form control checks it in ngx-firebase-ui
    private readonly checkboxStatusSubject = new BehaviorSubject<boolean[]>([false, false, false]);
    readonly areAllCheckboxesChecked$ = this.getAreAllCheckboxesChecked$();

    ngOnInit(): void {
        super.ngOnInit();
        this.handleNameFromControl();
    }

    openResetPasswordTab() {
        this.createForgotPasswordTab();
        this.maxNumberOfTabs = 3;
        this.tabIndexSubject.next(this.maxNumberOfTabs - 1);
    }

    swipeTabs(event): void {
        const index = this.tabIndexSubject.getValue();
        const newIndex = getSwipedIndex(event, index, this.maxNumberOfTabs - 1);
        this.tabIndexSubject.next(newIndex);
    }

    moveToTheMainMenu(): Promise<boolean> {
        return this.router.navigate([appInfo.internalLinks.linkToMenu]);
    }

    signInAndMoveToMainMenu(): Promise<any> {
        const email = this.signInEmailFormControl.value;
        const pwd = this.sigInPasswordFormControl.value;
        return this.auth.signInWithEmailAndPassword(email, pwd)
            .then(() => this.moveToTheMainMenu()) // even if not verifed -> move him to main menu
            .catch(error => this.openSnackbarToShowErrorMessage(error.message))
    }

    updateCheckboxArray(changes: MatCheckboxChange, indexCheckbox: number): void {
        const statusArray = this.checkboxStatusSubject.getValue();
        statusArray[indexCheckbox] = changes.checked;
        this.checkboxStatusSubject.next(statusArray);
    }

    addNewUser(): void {
        grecaptcha.ready(() => {
            const register$ = this.getRegisterUser$();
            const callbackAfterLoad = (resp: ResponseAddNewUser) => this.showErrorMessageIfFailed(resp);
            openDialogLoading(register$, this.dialog, callbackAfterLoad);
        });
    }


    // private

    private showErrorMessageIfFailed(response: ResponseAddNewUser) {
        if (!response.success) {
            const message = this.prettifyErrMsg(response.msg);
            this.openSnackbarToShowErrorMessage(message);
        }
    }

    private openSnackbarToShowErrorMessage(message: string) {
        this.snackbar.open(message, 'Ok', {politeness: 'polite', duration: 10000});
    }

    private getRegisterUser$() {
        const token$ = this.getReCaptchaToken$();
        const register$ = token$.pipe(
            switchMap((token: string) => this.registerUserForApp(token)),
            switchMap(response => this.registerUserForSpecificDatabase(response)),
            switchMap(response => this.loginIfRegisterWasSuccess(response))
        );
        return register$;
    }

    private loginIfRegisterWasSuccess(response: ResponseAddNewUser): Observable<ResponseAddNewUser> {
        let signIn$ = of(false);
        if (response.success) {
            signIn$ = this.signInFromRegister();
        }
        return signIn$.pipe(
            mapTo(response)
        );
    }

    private signInFromRegister(): Observable<boolean> {
        // no move to main menu because email need to be verified !
        const email = this.sigUpEmailFormControl.value;
        const pwd = this.sigUpPasswordFormControl.value;
        const promise = this.auth.signInWithEmailAndPassword(email, pwd)
            .then(() => this.moveToTheMainMenu())  // even if not verified -> move him to main menu !
            .then(() => this.auth.currentUser)
            .then(user => user.sendEmailVerification());
        return from(promise).pipe(
            mapTo(true)
        );
    }

    private registerUserForApp(token: string): Observable<ResponseAddNewUser> {
        const email = this.sigUpEmailFormControl.value;
        return requestRegisterUserForApp(email, token, this.http);
    }

    private registerUserForSpecificDatabase(response: ResponseAddNewUser): Observable<ResponseAddNewUser> {
        if (response.success && response.project !== undefined) {
            const email = this.sigUpEmailFormControl.value;
            const pwd = this.sigUpPasswordFormControl.value;
            return this.createUserAccount(email, pwd);
        } else {
            return of(response);
        }
    }

    private createUserAccount(email: string, pwd: string): Observable<ResponseAddNewUser> {
        const promise = this.auth.createUserWithEmailAndPassword(email, pwd)
            .then(() => ({success: true}))
            .catch((error) => ({success: false, msg: error.message}));
        return from(promise);
    }


    private getReCaptchaToken$() {
        // Also used hardcoded in index.html + also update the secret key used in backend
        const reCaptchaSharedKey = '6Le2s_kbAAAAAITo6mtfPWykKJ4W6Cb99fQH7GyX';
        const recaptchaPromise = grecaptcha.execute(reCaptchaSharedKey, {action: 'submit'});
        const recaptcha$ = from(recaptchaPromise);
        return recaptcha$;
    }

    private prettifyErrMsg(errMsg: string): string {
        const reCaptchaError = 'Google reCaptcha thinks you are a robot. \n' +
                'Please make sure you have cookies enabled and use the correct website: ' + appInfo.url;
        if (errMsg[0] === '[') { // make google recaptcha error msg prettier
            return reCaptchaError;
        } else {
            return errMsg;
        }
    }

    private handleNameFromControl() {
        this.sigUpNameFormControl.setValue(this.defaultUserName);
        this.sigUpNameFormControl.disable();
        this.sigUpNameFormControl.updateValueAndValidity();
    }

    private getAreAllCheckboxesChecked$(): Observable<boolean> {
        return this.checkboxStatusSubject.asObservable().pipe(
            map(statusArray => statusArray.every(status => status))
        );
    }
}
