import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {LoginRoutingModule} from './login-routing.module';
import {LoginScreenComponent} from '@app/pages/login/_components/login-screen/login-screen.component';
import {NgxAuthFirebaseUIModule} from 'ngx-auth-firebaseui';
import {SharedModule} from '@app/shared/shared.module';
import {AngularMaterialImportModule} from '@app/third-party/angular-material-import/angular-material-import.module';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {ReactiveFormsModule} from '@angular/forms';
import {MatPasswordStrengthModule} from '@angular-material-extensions/password-strength';
import {OtherProvidersComponent} from './_components/other-providers/other-providers.component';
import {LogoutScreenComponent} from './_components/logout-screen/logout-screen.component';
import {LoginComponent} from '@app/pages/login/login/login.component';
import {MatTooltipModule} from '@angular/material/tooltip';


@NgModule({
    declarations: [LoginComponent, LoginScreenComponent, OtherProvidersComponent, LogoutScreenComponent],
    imports: [
        CommonModule,
        NgxAuthFirebaseUIModule,
        LoginRoutingModule,
        SharedModule,
        AngularMaterialImportModule,
        MatProgressBarModule,
        ReactiveFormsModule,
        MatPasswordStrengthModule,
        MatTooltipModule,
    ]
})
export class LoginModule {
}
