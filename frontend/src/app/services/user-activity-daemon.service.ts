import {Injectable, OnDestroy} from '@angular/core';
import {AuthInfo, AuthService} from '@app/services/auth.service';
import {
    catchError,
    distinctUntilChanged,
    filter,
    map,
    skip,
    startWith,
    switchMap,
    tap,
    throttleTime
} from 'rxjs/operators';
import {isProVersionValid} from '@lib/user-role/pro-version/is-pro';
import {UserService} from '@app/services/user.service';
import {combineLatest, EMPTY, interval, Observable, Subscription} from 'rxjs';
import {Timestamp, UserData} from '@shared_library/datatypes/user';
import {HttpClient} from '@angular/common/http';
import {lastUserActivityExpireTimeInSec} from '@shared_library/settings/user';
import firebase from 'firebase/app';
import 'firebase/firestore';
import {mapTimestampToMs} from '@shared_library/functions/time/firestore-timestamp';
import {triggerAsyncScanCalculation} from '@lib/backend-api/trigger-async-scan';
import {onlyFirstEmitWillPass} from '@lib/rxjs/only-first-emit-will-pass';

export const testInjectionUserActivityDaemon = {
  isTestRun: false // prevent subscription on create which causes problem. Solution with exported injection obj is ugly.. better one ?
};

@Injectable({
  providedIn: 'root'
})
export class UserActivityDaemon implements OnDestroy {
  /* This service is a daemon. It makes it's own subscriptions, runs in the background and have no public interface.
   * Daemons are bad ! Try to avoid them.
   * The only service which is allowed to import a daemon-service is "background-activity"
  */
  private readonly intervalTimeMs = 60 * 1000;
  private readonly initialUserTimestampMs = 0;
  private readonly maxTimeOfAsyncExecutionMs = 30 * 1000;
  private readonly lastUserActivityExpireTimeInMs = lastUserActivityExpireTimeInSec * 1000;
  private readonly subscription: Subscription;

  constructor(private auth: AuthService, private user: UserService, private http: HttpClient) {
    const refresh$ = this.getRefreshUserActivity$();
    if (! testInjectionUserActivityDaemon.isTestRun) {
      this.subscription = refresh$.subscribe();
    }
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  // private

  private getRefreshUserActivity$(): Observable<any> {
    const lastUserActivityMs$ = this.getLastUserActivityInLocalMs$();
    const isEnabled$ = this.getIsEnabled$();
    const trigger$ = this.getTimeTrigger$();
    return combineLatest(lastUserActivityMs$, isEnabled$, trigger$).pipe(
        filter(([u1, isEnabled, u2]) => isEnabled),
        tap(params => this.logActivationDaemonProgress(...params)),
        filter(([timestamp, u1, u2]) => ! this.isTimestampStillFresh(timestamp)),
        throttleTime(this.maxTimeOfAsyncExecutionMs),
        map(([timestamp, u1, u2]) => timestamp),
        switchMap((timestampMs) => this.refreshTimestamp(timestampMs))
    );
  }

  private refreshTimestamp(timestampMs: number): Observable<any> {
    if (this.isTimestampStillValidForSyncCalculation(timestampMs)) {
      return this.updateTimestamp$();
    } else {
      return this.triggerAsyncScanCalculation$();
    }
  }

  private getLastUserActivityInLocalMs$(): Observable<number> {
    return combineLatest(this.auth.authUserInfo$, this.user.user$).pipe(
        filter(([info, user]) => this.isNoProNoDemoUser(info, user)),
        map(([info, user]) => info.uid),
        distinctUntilChanged(),
        switchMap(() => {
          return this.user.user$.pipe(
              map( user => user.lastUserActivity),
              filter(lastActivity => lastActivity !== null && lastActivity !== undefined),
              map(lastActivity => mapTimestampToMs(lastActivity as Timestamp)),
              distinctUntilChanged(),
              skip(1),
              map(() => Date.now()),
              startWith(this.initialUserTimestampMs)
          );
        })
    )
  }

  private getIsEnabled$(): Observable<boolean> {
    return combineLatest(this.auth.authUserInfo$, this.user.user$).pipe(
        map(([info, user]) => this.isNoProNoDemoUser(info, user)),
        distinctUntilChanged()
    )
  }

  private getTimeTrigger$(): Observable<number> {
    return interval(this.intervalTimeMs).pipe(
        startWith(-1)
    );
  }

  private updateTimestamp$(): Observable<any> {
    console.log('Activity daemon updates timestamp');
    const user: Partial<UserData> = {lastUserActivity: firebase.firestore.FieldValue.serverTimestamp()};
    return this.user.updateUserData(user);
  }

  private triggerAsyncScanCalculation$(): Observable<any> {
    console.log('Activity daemon triggers async calculation');
    return this.auth.getTokenId$().pipe(
        onlyFirstEmitWillPass(),
        switchMap(tokenId => triggerAsyncScanCalculation(tokenId, this.http).pipe(
            catchError(err => {console.error('Error during async calculation', err); return EMPTY;}))));
  }

  private isNoProNoDemoUser(info: AuthInfo, user: UserData): boolean {
    return ! (info.isDemo || isProVersionValid(user));
  }

  private isTimestampStillFresh(timestampLocalMs: number): boolean {
    const expireTime = this.lastUserActivityExpireTimeInMs - this.intervalTimeMs;
    return timestampLocalMs + expireTime > Date.now();
  }

  private isTimestampStillValidForSyncCalculation(timestampLocalMs: number): boolean {
    const expireTime = this.lastUserActivityExpireTimeInMs;
    return timestampLocalMs + expireTime > Date.now();
  }

  private logActivationDaemonProgress(timestampMs, isEnabled, triggerNumber): void {
    const secGreaterCurrent =  Math.round((Date.now() - timestampMs) / 1000);
    const msg = `Activation Daemon timestamp is ${secGreaterCurrent} sec over current time. If it is more then ${lastUserActivityExpireTimeInSec} sec over it won't be selcted for sync calculation. `;
    const params = `\nParams are: Timestamp: ${timestampMs}, isEnabled: ${isEnabled}, TriggerNumber: ${triggerNumber}`;
    console.log(msg, params);
  }
}
