import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {AndroidRoutingModule} from './android-routing.module';
import {WelcomeAndroidComponent} from './welcome-android/welcome-android.component';


@NgModule({
  declarations: [
    WelcomeAndroidComponent
  ],
  imports: [
    CommonModule,
    AndroidRoutingModule
  ]
})
export class AndroidModule { }
