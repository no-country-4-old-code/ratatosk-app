import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {LandingPageComponent} from "@app/pages/landing-page/landing-page/landing-page.component";

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: LandingPageComponent
      }
    ]
  }
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LandingPageRoutingModule { }
