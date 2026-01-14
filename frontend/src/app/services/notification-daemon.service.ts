import {Injectable} from '@angular/core';
import {AngularFireMessaging} from '@angular/fire/messaging';
import {SwPush} from '@angular/service-worker';
import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/messaging';
import {UserService} from '@app/services/user.service';
import {AuthService} from '@app/services/auth.service';
import {distinctUntilChanged, filter, map, switchMap, take} from 'rxjs/operators';
import {combineLatest, Observable, of} from 'rxjs';
import {maxNumberOfPushIds} from '@shared_library/settings/user';
import {isPro} from '@shared_library/functions/is-pro';
import {firebaseConfigurations} from '@shared_library/settings/firebase-projects';

@Injectable({
	providedIn: 'root'
})
export class NotificationDaemon {
	/* This service is a daemon. It makes it's own subscriptions, runs in the background and have no public interface.
	 * Daemons are bad ! Try to avoid them.
	 * The only service which is allowed to import a daemon-service is "background-activity"
	 */

	constructor(private afMessaging: AngularFireMessaging, private swPush: SwPush, private user: UserService,
				private auth: AuthService) {
		this.afterInit(() => {
			this.onTokenRefresh((id) => this.processNewPushId(id));
			this.askForNotificationPermission((id) => this.processNewPushId(id));
		});
	}
	private afterInit(callback: () => void) {
		if (this.swPush.isEnabled) {
			navigator.serviceWorker
				.ready
				.then((registration) => {
					firebase.initializeApp(firebaseConfigurations['USER_001']);
					firebase.messaging().useServiceWorker(registration);
					callback();
				});
		}
	}

	private askForNotificationPermission(callback: (token: string) => void) {
		const messaging = firebase.messaging();  // could only be called after firebase app is initialized
		messaging.requestPermission()
			.then(() => messaging.getToken()
				.then(token => callback(token))).catch(err => console.error('@NotificationDaemon: ', err));
	}

	private onTokenRefresh(callback: (token: string) => void) {
		const messaging = firebase.messaging();  // could only be called after firebase app is initialized
		messaging.onTokenRefresh(() => messaging.getToken()
			.then(token => callback(token)).catch(err => console.error('Unable to retrieve refreshed token ', err)));
	}

	private processNewPushId(newPushId: string): void {
		const isPro$ = this.getIsPro$();
		const isDemo$ = this.getIsDemo$();
		combineLatest(isPro$, isDemo$).pipe(
			filter(([isPro, isDemo]) => isPro && ! isDemo),
			switchMap(() => this.handlePushIdUpdate$(newPushId)),
			take(1), // only once for each device
		).subscribe();
	}

	private getIsPro$(): Observable<boolean> {
		return this.user.user$.pipe(
			map(isPro),
			distinctUntilChanged()
		);
	}

	private getIsDemo$(): Observable<boolean> {
		return this.auth.authUserInfo$.pipe(
			map(auth => auth.isDemo),
			distinctUntilChanged()
		);
	}

	private handlePushIdUpdate$(token: string): Observable<boolean> {
		return this.user.user$.pipe(
			switchMap(user => {
				if (this.isTokenNew(token, user.pushIds)) {
					return this.updatePushIds$(token, user.pushIds);
				} else {
					return of(false);
				}
			})
		);
	}

	private isTokenNew(token: string, pushIds: string[]): boolean {
		return ! pushIds.includes(token);
	}

	private updatePushIds$(token: string, oldPushIds: string[]): Observable<boolean> {
		let pushIds = [...oldPushIds];
		if (! pushIds.includes(token)) {
			pushIds.unshift(token);
		}
		if (pushIds.length > maxNumberOfPushIds) {
			pushIds = pushIds.slice(0, maxNumberOfPushIds);
		}
		return this.user.updateUserData({pushIds});
	}
}
