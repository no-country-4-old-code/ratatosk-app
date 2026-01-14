import {Injectable} from '@angular/core';
import {AngularFirestore} from '@angular/fire/firestore';
import {throwErrorIfInvalid} from 'app/lib/util/error';
import {Coin} from '@app/lib/coin/interfaces';
import {filter, map, scan, shareReplay, switchMap, tap} from 'rxjs/operators';
import {UserService} from '@app/services/user.service';
import {getCurrency$} from '@app/lib/multiple-used/get-currency$';
import {mapToClone} from '@app/lib/rxjs/map-to-clone';
import {Currency} from '../../../../shared-library/src/datatypes/currency';
import {combineLatest, Observable} from 'rxjs';
import {readBucketSnapshotCoin, readStorageHistoryCoin} from '@app/lib/firestore/read';
import {Meta, MetaData} from '../../../../shared-library/src/datatypes/meta';
import {changeHistoryCurrency, changeSnapshotCurrency} from '@app/lib/coin/currency/map-to-different-currency';
import {mapStorage2Coins} from '@app/lib/firestore/mapFirestore';
import {HotStreamArray} from '@app/lib/util/hot-stream-array';
import {assetCoin} from "../../../../shared-library/src/asset/lookup-asset-factory";
import {AssetIdCoin} from "../../../../shared-library/src/asset/assets/coin/interfaces";
import {Bucket, History, Storage} from "../../../../shared-library/src/datatypes/data";
import {addMeta} from "../../../../shared-library/src/functions/general/types";
import {ScanService} from '@app/services/scan.service';
import {Scan} from '@shared_library/scan/interfaces';

interface TimestampCheck {
	isUpdateNeeded: boolean;
	timestamp: number;
}

@Injectable({
	providedIn: 'root'
})
export class CoinService {
	readonly coins$: Observable<Coin[]>;
	private readonly streamHistoryArray: HotStreamArray<Meta<History<'coin'>>>;
	private readonly maxNumberOfCachesInArray: 3; // read with every user push

	constructor(private firestore: AngularFirestore, user: UserService, private scanService: ScanService) {
		const currency$ = getCurrency$(user);
		this.coins$ = this.getCoins$(currency$);
		this.streamHistoryArray =  new HotStreamArray((id: AssetIdCoin) => this.getHistory$(id, currency$), this.maxNumberOfCachesInArray);
	}

	getCoinByID(id: AssetIdCoin): Observable<Coin> {
		return this.coins$.pipe(
			map(coins => coins.find(coin => coin.id === id)),
			tap(asset => this.logErrorIfNotFound(asset, 'GetCoinById could not find asset with ' + id)),
			filter(asset => asset !== undefined));
	}

	getCoinHistoryWithMetaData(id: AssetIdCoin): Observable<Meta<History<'coin'>>> {
		return this.streamHistoryArray.getStreamById(id);
	}

	// private

	private getCoins$(currency$: Observable<Currency>): Observable<Coin[]> {
		const snapshot$ = this.getBucketSnapshot$();
		return combineLatest(snapshot$, currency$).pipe(
			map(([bucket, currency]) => this.changeCurrencyForCoins(bucket, currency)),
			tap(([allCoins, meta]) => console.log('DEBUG: new snapshot', meta.timestampMs, allCoins, meta)),
			map(([allCoins, meta]) => mapStorage2Coins(allCoins, meta)),
			tap(throwErrorIfInvalid),
			shareReplay(1),
			mapToClone()
		);
	}

	private getHistory$(id: AssetIdCoin, currency$: Observable<Currency>): Observable<Meta<History<'coin'>>> {
		const history$ = this.getHistoryWithMetaData$(id);
		return combineLatest(history$, currency$).pipe(
			map(([doc, currency]) => this.changeCurrencyForHistory(doc, currency)),
			tap(([history, meta]) => console.log('DEBUG: new history', meta.timestampMs, history, meta)),
			map(([history, meta]) => addMeta(history, meta)),
			tap(throwErrorIfInvalid),
			shareReplay(1),
			mapToClone(),
			tap(x => console.log('And now...', x))
		);
	}

	private getBucketSnapshot$(): Observable<Bucket<'coin', 'SNAPSHOT'>> {
		const initialTimestampCheck: TimestampCheck = {isUpdateNeeded: false, timestamp: 0};
		return this.scanService.scans$.pipe(
			map(scans => this.getMaxScanTimestamp(scans)),
			scan((old, newTimestamp) => this.createTimestampCheck(old, newTimestamp), initialTimestampCheck),
			filter(timestampCheck => timestampCheck.isUpdateNeeded),
			switchMap(() => readBucketSnapshotCoin(this.firestore)),
			shareReplay(1)
		);
	}

	private getHistoryWithMetaData$(id: AssetIdCoin): Observable<Meta<History<'coin'>>> {
		const initialTimestampCheck: TimestampCheck = {isUpdateNeeded: false, timestamp: -Infinity};
		return this.scanService.scans$.pipe(
			map(scans => this.getMaxScanTimestamp(scans)),
			tap(x => console.log('New filters for histoy with id ', id, x)),
			scan((old, newTimestamp) => this.createTimestampCheck(old, newTimestamp), initialTimestampCheck),
			filter(timestampCheck => timestampCheck.isUpdateNeeded),
			tap(x => console.log('Update seems to be neccassray ', x)),
			switchMap(() => readStorageHistoryCoin(this.firestore, id)),
			shareReplay(1)
		);
	}

	private createTimestampCheck(old: TimestampCheck, newTimestamp: number): TimestampCheck {
		return {
			isUpdateNeeded: newTimestamp > old.timestamp,
			timestamp: Math.max(newTimestamp, old.timestamp)
		};
	}

	private getMaxScanTimestamp(scans: Scan[]): number {
		const timestamps = scans.map(scan => scan.timestampResultData);
		return Math.max(...timestamps, 0); // min value is 0
	}

	private changeCurrencyForHistory(doc: Meta<History<'coin'>>, destCurrency: Currency): [History<'coin'>, MetaData] {
		const history: History<'coin'> = changeHistoryCurrency(doc.payload, doc.meta, destCurrency);
		// nullify exchange rates after change of metadata
		const meta: MetaData = {...doc.meta, ratesTo$: null, unit: destCurrency};
		return [history, meta];
	}

	private changeCurrencyForCoins(doc: Meta<Storage<'coin', 'SNAPSHOT'>>, destCurrency: Currency): [Storage<'coin', 'SNAPSHOT'>, MetaData] {
		const storage: Storage<'coin', 'SNAPSHOT'> = {...doc.payload};
		assetCoin.getIdsInStorage(storage).forEach(id => {
			storage[id] = changeSnapshotCurrency(storage[id], doc.meta, destCurrency);
		});
		const meta: MetaData = {...doc.meta, ratesTo$: null, unit: destCurrency};
		return [storage, meta];
	}

	private logErrorIfNotFound(asset: object, errMsg: string): void {
		if (asset === undefined) {
			console.error('Error : ', errMsg);
		}
	}
}
