import {AngularFireModule} from '@angular/fire';
import {AngularFireAuthModule} from '@angular/fire/auth';
import {AngularFirestoreModule} from '@angular/fire/firestore';
import {NgxAuthFirebaseUIModule} from 'ngx-auth-firebaseui';
import {NgModule} from '@angular/core';
import {AngularFireMessagingModule} from '@angular/fire/messaging';
import {firebaseConfigurations} from '@shared_library/settings/firebase-projects';

export function appNameFactory() {
	return 'your_app_name_factory';
}

const ngxAuthConfig = {
	enableFirestoreSync: false, // enable/disable autosync users with firestore
	toastMessageOnAuthSuccess: false, // whether to open/show a snackbar message on auth success - default : true
	toastMessageOnAuthError: true, // whether to open/show a snackbar message on auth error - default : true
	authGuardFallbackURL: '/login', // url for unauthenticated users - to use in combination with canActivate feature on a route
	authGuardLoggedInURL: '/scans', // url for authenticated users - to use in combination with canActivate feature on a route
	passwordMaxLength: 20, // `min/max` input parameters in components should be within this range.
	passwordMinLength: 8, // Password length min/max in forms independently of each componenet min/max.
	// Same as password but for the name
	nameMaxLength: 20,
	nameMinLength: 3,
	// If set, sign-in/up form is not available until email has been verified.
	// Plus protected routes are still protected even though user is connected.
	guardProtectedRoutesUntilEmailIsVerified: true,
	enableEmailVerification: true, // default: true
};


@NgModule({
	imports: [
		AngularFireModule.initializeApp(firebaseConfigurations['USER_001']),
		NgxAuthFirebaseUIModule.forRoot(firebaseConfigurations['USER_001'], appNameFactory, ngxAuthConfig)
	],
	exports: [
		AngularFireModule,
		AngularFirestoreModule,
		AngularFireAuthModule,
		NgxAuthFirebaseUIModule,
		AngularFireMessagingModule
	]
})
export class FirebaseModulesExtra {
}
