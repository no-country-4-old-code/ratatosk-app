import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {WelcomeAndroidComponent} from "@app/pages/android/welcome-android/welcome-android.component";

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: WelcomeAndroidComponent
      }
    ]
  }
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AndroidRoutingModule { }
