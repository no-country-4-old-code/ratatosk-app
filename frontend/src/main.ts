import {enableProdMode} from '@angular/core';
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';
import 'hammerjs';
import {AppModule} from '@app/app.module';
import {environment} from 'environments/environment';
import {isPublicRelease} from '@shared_library/settings/firebase-projects';

if (environment.production) {
	enableProdMode();
	if (isPublicRelease) {
		if (window) {
			// no logs or warnings in public release
			window.console.log = function () {};
			window.console.warn = function () {};
		}
	}
}

platformBrowserDynamic().bootstrapModule(AppModule)
	.catch(err => console.error(err));
