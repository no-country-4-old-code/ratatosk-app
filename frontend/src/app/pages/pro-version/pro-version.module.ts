import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ProVersionRoutingModule} from './pro-version-routing.module';
import {ProVersionComponent} from './pro-version/pro-version.component';
import {SharedModule} from '@app/shared/shared.module';
import {ContextUserComponent} from './_components/context-user/context-user.component';
import {ContextProComponent} from './_components/context-pro/context-pro.component';
import {AngularMaterialImportModule} from '@app/third-party/angular-material-import/angular-material-import.module';
import {ScrollingModule} from '@angular/cdk/scrolling';
import {DialogInfoComponent} from './_components/dialog-info/dialog-info.component';


@NgModule({
    declarations: [ProVersionComponent, ContextUserComponent, ContextProComponent, DialogInfoComponent],
    imports: [
        CommonModule,
        ProVersionRoutingModule,
        SharedModule,
        AngularMaterialImportModule,
        ScrollingModule
    ]
})
export class ProVersionModule {
}
