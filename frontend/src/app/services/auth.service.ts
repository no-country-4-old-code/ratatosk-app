import {Injectable} from '@angular/core';
import {AngularFireAuth} from '@angular/fire/auth';
import {distinctUntilChanged, map, shareReplay, switchMap, tap} from 'rxjs/operators';
import {Observable, of} from 'rxjs';
import firebase from 'firebase/app';
import 'firebase/auth';
import {areObjectsEqual} from '../../../../shared-library/src/functions/general/object';
import {mapToClone} from '@app/lib/rxjs/map-to-clone';
import {MultiDbFireauthService} from '@app/services/multi-db-fireauth.service';
import {demoUID} from '@shared_library/settings/firebase-projects';

export interface AuthInfo extends firebase.UserInfo {
	isDemo: boolean;
	emailVerified: boolean; // is part of UserInfo class but not of interface
}


@Injectable({
	providedIn: 'root'
})
export class AuthService {
	readonly authUserInfo$: Observable<AuthInfo>;
	readonly isLoggedIn$: Observable<boolean>;

	constructor(private afAuth: AngularFireAuth, private multiDbAuth: MultiDbFireauthService) {
		this.authUserInfo$ = this.getAuthUserInfo$();
		this.isLoggedIn$ = this.authUserInfo$.pipe(
			map((resp: AuthInfo): boolean => !resp.isDemo),
			distinctUntilChanged(),
			shareReplay(1)
		);
		// TODO: authState is only triggered on login/logout. Login/Logout are actually done with the "origin" AngularFireAuth.
		//  Therefore our auths are not triggered
		//this.multiDbAuth.readFromOwnAuth().subscribe(result => console.log('Receive this from own auth', result));
		//this.multiDbAuth.readScheduleUserAuth().subscribe(result => console.log('Receive this from other auth', result));
	}

	getTokenId$(): Observable<string> {
		/*
		The tokenId could expire. Therefore we can not put it in AuthInfo.
		Instead we have to call "getIdToken" to check if the token is expired and refresh it in this case.
	   */
		return this.afAuth.authState.pipe(
			switchMap(user => user.getIdToken())
		);
	}

	// private

	private getAuthUserInfo$(): Observable<AuthInfo> {
		return this.afAuth.authState.pipe(
			tap(log => console.log('Here in real auth: ', log)),
			switchMap(user => this.fillExtendedUserInfo(user)),
			distinctUntilChanged((obj1, obj2) => areObjectsEqual(obj1, obj2)),
			shareReplay(1),
			mapToClone());
	}

	private fillExtendedUserInfo(user: firebase.User | null): Observable<AuthInfo> {
		let authInfo: AuthInfo;
		if (user === null) {
			authInfo = this.getDemoInfo();
		} else {
			authInfo = this.mapUserInfo2Extended(user);
		}
		return of(authInfo);
	}

	private mapUserInfo2Extended(user: firebase.UserInfo): AuthInfo {
		return {
			uid: user.uid,
			displayName: user.displayName,
			email: user.email,
			phoneNumber: user.phoneNumber,
			photoURL: user.photoURL,
			providerId: user.providerId,
			isDemo: false,
			emailVerified: (user as any).emailVerified
		};
	}

	private getDemoInfo(): AuthInfo {
		return {
			uid: demoUID,
			displayName: 'Demo',
			email: '',
			phoneNumber: '',
			photoURL: '',
			providerId: '',
			isDemo: true,
			emailVerified: true
		};
	}
}
