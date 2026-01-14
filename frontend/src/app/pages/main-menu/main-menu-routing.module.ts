import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {MainMenuComponent} from '@app/pages/main-menu/menu/main-menu.component';
import {OptionsComponent} from '@app/pages/main-menu/options/options.component';
import {ImpressumComponent} from '@app/pages/main-menu/impressum/impressum.component';


const routes: Routes = [
    {
        path: '',
        children: [
            {
                path: '',
                component: MainMenuComponent
            },
            {
                path: 'options',
                component: OptionsComponent
            },
            {
                path: 'options/impressum',
                component: ImpressumComponent
            },
            {
                path: 'options/settings',
                loadChildren: () => import('../user-settings/user-settings.module').then(m => m.UserSettingsModule)
            },
            {
                path: 'options/pro-version',
                loadChildren: () => import('../pro-version/pro-version.module').then(m => m.ProVersionModule)
            },
            {
                path: 'options/about',
                loadChildren: () => import('../about/about.module').then(m => m.AboutModule)
            },
            {
                path: 'options/legal-notes',
                loadChildren: () => import('../legal-notes/legal-notes.module').then(m => m.LegalNotesModule)
            },
            {
                path: 'options/login',
                loadChildren: () => import('../login/login.module').then(m => m.LoginModule)
            },
            {
                path: 'options/howto',
                loadChildren: () => import('../how-to/how-to.module').then(m => m.HowTo)
            },
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class MainMenuRoutingModule {
}
