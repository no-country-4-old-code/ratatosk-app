import {Injectable} from '@angular/core';
import {AngularFirestore} from '@angular/fire/firestore';
import {catchError, filter, mapTo, shareReplay, switchMap, take, tap} from 'rxjs/operators';
import {EMPTY, Observable, of} from 'rxjs';
import {listenToStorageUser} from '@app/lib/firestore/read';
import {AuthInfo, AuthService} from '@app/services/auth.service';
import {updateStorageUser} from '@app/lib/firestore/update';
import {mapToClone} from '@app/lib/rxjs/map-to-clone';
import {Timestamp, UserData} from '../../../../shared-library/src/datatypes/user';
import {onlyFirstEmitWillPass} from '@lib/rxjs/only-first-emit-will-pass';

@Injectable({
	providedIn: 'root'
})
export class UserService {
	readonly user$: Observable<UserData>;

	constructor(private firestore: AngularFirestore, private auth: AuthService) {
		this.user$ = this.getUser$();
	}

	updateUserData(userData: Partial<UserData>): Observable<boolean> {
		console.log('DEBUG: Init update ', userData);
		return this.auth.authUserInfo$.pipe(
			onlyFirstEmitWillPass(),
			filter(info => !info.isDemo),
			switchMap((info: AuthInfo) => this.getUpdate$(userData, info)),
			tap(x => console.warn('UPDATE of firestore user data', userData.scans, x, userData)));
	}

	// private

	private getUser$(): Observable<UserData> {
		return this.auth.authUserInfo$.pipe(
			switchMap((info: AuthInfo) => {
				if (info.isDemo) {
					return this.getStaticDemoUserData$();
				} else {
					return this.getActiveConnection2User$(info.uid);
				}
			}),
			tap(x => console.warn('UPDATE of local user data', x)),
			shareReplay(1),
			mapToClone());
	}

	private getUpdate$(userData: Partial<UserData>, info: AuthInfo): Observable<boolean> {
		const updatedUserData = {...userData};
		const update$ = updateStorageUser(updatedUserData, this.firestore, info.uid);
		return update$.pipe(
			mapTo(true),
			take(1),
			catchError(this.handleUpdateFail)
		);
	}

	private handleUpdateFail(err): Observable<boolean> {
		console.error('ERROR during update of user data ', err);
		return of(false);
	}

	private handleDownloadFail(err): Observable<any> {
		console.error('ERROR during download of user data ', err);
		return EMPTY;
	}

	private getActiveConnection2User$(uid: string): Observable<UserData> {
		return listenToStorageUser(this.firestore, uid).pipe(
			catchError(this.handleDownloadFail))
	}

	private getStaticDemoUserData$(): Observable<UserData> {
		const user: UserData = {
			pro: {hasCanceledProVersion: false, useProVersionUntil: 0},
			settings: {currency: 'usd'},
			scans: [],
			lastUserActivity: new Date() as any as Timestamp,
			pushIds: []
		};
		return of(user);
	}

}
