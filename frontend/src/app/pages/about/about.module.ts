import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {AboutRoutingModule} from 'app/pages/about/about-routing.module';
import {AboutComponent} from './about/about.component';
import {SharedModule} from '@app/shared/shared.module';
import {AngularMaterialImportModule} from '@app/third-party/angular-material-import/angular-material-import.module';

@NgModule({
    declarations: [AboutComponent],
    imports: [
        CommonModule,
        AboutRoutingModule,
        SharedModule,
        AngularMaterialImportModule
    ]
})
export class AboutModule {
}
