import {Injectable} from '@angular/core';
import {UserService} from '@app/services/user.service';
import {CoinService} from '@app/services/coin.service';
import {combineLatest, Observable, of} from 'rxjs';
import {distinctUntilChanged, map, shareReplay, switchMap} from 'rxjs/operators';
import {AuthService} from '@app/services/auth.service';
import {UserData} from '@shared_library/datatypes/user';
import {lookupAssetFactory} from '@shared_library/asset/lookup-asset-factory';
import {Scan} from '@shared_library/scan/interfaces';
import {isPro} from '@shared_library/functions/is-pro';

@Injectable({
  providedIn: 'root'
})
export class AreScansSynchronizedService {
  readonly areScansSynchronized$: Observable<boolean>;

  constructor(private auth: AuthService, private user: UserService, private coin: CoinService) {
    this.areScansSynchronized$ = this.getAreScansSynchronized$();
  }

  // private

  private getAreScansSynchronized$(): Observable<boolean> {
    return combineLatest(this.auth.authUserInfo$, this.user.user$).pipe(
        switchMap(([auth, user]) => this.selectSynchronizeCheck(auth.isDemo, user)),
        distinctUntilChanged(),
        shareReplay(1)
    );
  }

  private selectSynchronizeCheck(isDemo: boolean, user: UserData): Observable<boolean> {
    if(isDemo || isPro(user)) {
      return of(true);  // demo and pro user are always synchronized
    } else {
      return this.getSynchronizedCheck$(user);
    }
  }

  private getSynchronizedCheck$(user: UserData): Observable<boolean> {
    const timestampUserData = this.getMaxTimestampOfScans(user.scans);
    const someId = lookupAssetFactory['coin'].getIds()[0];
    return this.coin.getCoinHistoryWithMetaData(someId).pipe(
        map(bucket => bucket.meta.timestampMs),
        map(timestampServer => timestampServer <= timestampUserData)
    )
  }

  private getMaxTimestampOfScans(scans: Scan[]): number {
    const timestamps = scans.map(scan => scan.timestampResultData);
    if (timestamps.length > 0) {
      return Math.max(...timestamps);
    } else {
      return 0;
    }
  }

}
