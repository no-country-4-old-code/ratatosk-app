import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {LegalNotesRoutingModule} from './legal-notes-routing.module';
import {LegalNotesMenuComponent} from './menu/legal-notes-menu.component';
import {SharedModule} from '@app/shared/shared.module';
import {CookiePolicyComponent} from './cookie-policy/cookie-policy.component';
import {PrivatePolicyComponent} from './private-policy/private-policy.component';
import {TermsAndCondtionsComponent} from './terms-and-conditions/terms-and-condtions.component';
import {AngularMaterialImportModule} from '@app/third-party/angular-material-import/angular-material-import.module';
import {DisclaimerComponent} from './disclaimer/disclaimer.component';


@NgModule({
    declarations: [LegalNotesMenuComponent, CookiePolicyComponent, PrivatePolicyComponent, TermsAndCondtionsComponent, DisclaimerComponent],
    imports: [
        CommonModule,
        LegalNotesRoutingModule,
        SharedModule,
        AngularMaterialImportModule
    ]
})
export class LegalNotesModule {
}
