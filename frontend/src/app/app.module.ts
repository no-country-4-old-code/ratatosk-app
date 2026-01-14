import {BrowserModule} from '@angular/platform-browser';
import {LOCALE_ID, NgModule} from '@angular/core';
import {AppRoutingModule} from '@app/app-routing.module';
import {AppComponent} from '@app/app.component';
import localeEn from '@angular/common/locales/en';
import {registerLocaleData} from '@angular/common';
import {FirebaseModulesExtra} from '@app/third-party/firebase/firebase-import.module';
import {ServiceWorkerModule} from '@angular/service-worker';
import {environment} from 'environments/environment';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {OnDestroyMixin} from '@app/lib/components/mixin-on-destroy';

registerLocaleData(localeEn);


@NgModule({
	declarations: [
		AppComponent,
		OnDestroyMixin
	],
	imports: [
		BrowserModule,  // import only once and at the beginning !
		BrowserAnimationsModule, // import only once
		AppRoutingModule,
		FirebaseModulesExtra,
		ServiceWorkerModule.register('ngsw-worker.js', {enabled: environment.production}),
	],
	providers: [{provide: LOCALE_ID, useValue: 'en-US'}],
	bootstrap: [AppComponent],
})
export class AppModule {
}
