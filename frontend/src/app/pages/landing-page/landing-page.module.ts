import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {LandingPageRoutingModule} from './landing-page-routing.module';
import {LandingPageComponent} from './landing-page/landing-page.component';
import {AngularMaterialImportModule} from "@app/third-party/angular-material-import/angular-material-import.module";


@NgModule({
  declarations: [
    LandingPageComponent
  ],
  imports: [
    CommonModule,
    LandingPageRoutingModule,
    AngularMaterialImportModule
  ]
})
export class LandingPageModule { }
