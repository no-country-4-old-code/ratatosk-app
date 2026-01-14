import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {LegalNotesMenuComponent} from '@app/pages/legal-notes/menu/legal-notes-menu.component';
import {TermsAndCondtionsComponent} from '@app/pages/legal-notes/terms-and-conditions/terms-and-condtions.component';
import {CookiePolicyComponent} from '@app/pages/legal-notes/cookie-policy/cookie-policy.component';
import {PrivatePolicyComponent} from '@app/pages/legal-notes/private-policy/private-policy.component';
import {DisclaimerComponent} from '@app/pages/legal-notes/disclaimer/disclaimer.component';


const routes: Routes = [
    {
        path: '',
        children: [
            {
                path: '',
                component: LegalNotesMenuComponent
            },
            {
                path: 'terms-and-conditions',
                component: TermsAndCondtionsComponent
            },
            {
                path: 'cookie-policy',
                component: CookiePolicyComponent
            },
            {
                path: 'privacy-policy',
                component: PrivatePolicyComponent
            },
            {
                path: 'disclaimer',
                component: DisclaimerComponent
            },
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class LegalNotesRoutingModule {
}
