import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MainMenuComponent} from '@app/pages/main-menu/menu/main-menu.component';
import {RouterModule} from '@angular/router';
import {AngularMaterialImportModule} from '@app/third-party/angular-material-import/angular-material-import.module';
import {SharedModule} from '@app/shared/shared.module';
import {OptionsComponent} from './options/options.component';
import {ScansModule} from '@pages_scans/scans.module';
import {MainMenuRoutingModule} from '@app/pages/main-menu/main-menu-routing.module';
import {ClipboardModule} from '@angular/cdk/clipboard';
import {HammerModule} from '@angular/platform-browser';
import {ImpressumComponent} from './impressum/impressum.component';


@NgModule({
    declarations: [MainMenuComponent, OptionsComponent, ImpressumComponent],
    imports: [
        CommonModule,
        MainMenuRoutingModule,  // before other modules
        AngularMaterialImportModule,
        RouterModule,
        SharedModule,
        ScansModule,
        ClipboardModule,
        HammerModule
    ],
    exports: [
        MainMenuComponent
    ]
})
export class MainMenuModule {
}
