import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Error404RoutingModule} from './error404-routing.module';
import {Error404Component} from "@app/pages/error404/show-error/error404.component";
import {SharedModule} from "@app/shared/shared.module";


@NgModule({
  declarations: [
      Error404Component
  ],
  imports: [
    CommonModule,
    SharedModule,
    Error404RoutingModule
  ]
})
export class Error404Module { }
