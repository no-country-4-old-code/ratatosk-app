import {CoinService} from '@app/services/coin.service';
import {expectMarbles, marbleRun} from '@test/helper-frontend/marble/functions.spec';
import {buildAllMocks, MockControlArray} from '@test/helper-frontend/mocks/all';
import {cold} from 'jasmine-marbles';
import {createDummyUserData} from '../../../../shared-library/src/functions/test-utils/dummy-data/user';
import {UserData} from '../../../../shared-library/src/datatypes/user';
import {addMeta} from '../../../../shared-library/src/functions/general/types';
import {lookupMarble2Currency, lookupMarble2Numbers, MarbleLookup} from '@test/helper-frontend/marble/lookup';
import {map, shareReplay, switchMap} from 'rxjs/operators';
import {Meta} from '../../../../shared-library/src/datatypes/meta';
import {createDummyMetaData} from '../../../../shared-library/src/functions/test-utils/dummy-data/meta';
import {AssetId, History} from '../../../../shared-library/src/datatypes/data';
import {assetCoin} from '../../../../shared-library/src/asset/lookup-asset-factory';
import {AssetIdCoin} from '../../../../shared-library/src/asset/assets/coin/interfaces';
import {CompressedHistory, CompressedStorageSnapshot} from '../../../../shared-library/src/datatypes/compress';
import {ScanFrontend} from '@lib/scan/interfaces';
import {createDummyScans} from '@shared_library/functions/test-utils/dummy-data/scan';
import {mapScan2Frontend} from '@lib/firestore/mapFirestore';
import {of} from 'rxjs';
import {Coin} from '@lib/coin/interfaces';
import {lookupCoinMetric2Compression} from '@shared_library/asset/assets/coin/helper/lookup-metric-compression';
import {deepCopy} from '@shared_library/functions/general/object';

function createScans(numberOfScans: number, timestampMs: number): ScanFrontend[] {
  const scans = createDummyScans(numberOfScans, 0);
  return scans.map(scan => {
    const scanFrontend = mapScan2Frontend(scan);
    scanFrontend.timestampResultData = timestampMs;
    return scanFrontend;
  });
}

describe('CoinService', () => {
  const changedId: AssetIdCoin = 'id42';

  const lookupTimestampMs: MarbleLookup<number> = {
    a: 123,
    b: 456,
    c: 789
  };

  const lookupUserData: MarbleLookup<UserData> = {
    d: {...createDummyUserData(), settings: {currency: 'usd'}},
    e: {...createDummyUserData(), settings: {currency: 'eur'}},
  };
  const lookupScans: MarbleLookup<ScanFrontend[]> = {
    a: createScans(3, lookupTimestampMs.a),
    b: createScans(3, lookupTimestampMs.b),
    c: createScans(3, lookupTimestampMs.c),
    d: createScans(2, lookupTimestampMs.a),
    e: [],
  };

  let service: CoinService;
  let mocks: MockControlArray;

  beforeEach(() => {
    mocks = buildAllMocks();
    mocks.user.control.user$ = cold('d', lookupUserData);
    service = new CoinService(mocks.firestore.mock, mocks.user.mock, mocks.scan.mock);
  });

  describe('Update coin snapshot', function () {

    function createCompressedStorageSnapshot(ids: AssetId<any>[]): CompressedStorageSnapshot  {
      const initFirstValue = Math.round(100 * Math.random() + 1);
      const storage = assetCoin.createDummyStorageSnapshot(ids, initFirstValue);
      return assetCoin.compressStorageSnapshot(storage);
    }

    function map2Timestamp(coins: Coin[]): number {
      const index = assetCoin.getIds().length - coins.length;
      const chars = ['a', 'b', 'c'];
      return lookupTimestampMs[chars[index]];
    }

    function mapTimestamp2Storage(idOfTimestamp: string): Meta<CompressedStorageSnapshot> {
      const timestamp = lookupTimestampMs[idOfTimestamp];
      const ids = assetCoin.getIds().slice(lookupMarble2Numbers[idOfTimestamp]);
      return addMeta( createCompressedStorageSnapshot(ids), createDummyMetaData(timestamp) );
    }

    const lookupFirestore: MarbleLookup<Meta<CompressedStorageSnapshot>> = {
      a: mapTimestamp2Storage('a') ,
      b: mapTimestamp2Storage('b') ,
      c: mapTimestamp2Storage('c') ,
    };

    function act(updateFirestore$, expected$, env): void {
      const timestamp$ = service.coins$.pipe(map(map2Timestamp));
      updateFirestore$.subscribe(storage => {mocks.firestore.control.getResponse$ = of(storage);});
      expectMarbles(timestamp$, expected$, env);
    }

    it('should only fetch new data lead by scan changes (even if firestore already contain new data)', () => marbleRun( env => {
      const updateFirestore$ = env.hot( 'a-b-c-----', lookupFirestore);
      mocks.scan.control.scans$ = cold( 'a--------c', lookupScans);
      const expected$ = cold(           'a--------c', lookupTimestampMs);
      act(updateFirestore$, expected$, env);
    }));

    it('should fetch new data if cache is older then data used for scan calculation', () => marbleRun( env => {
      const updateFirestore$ = env.hot( 'a-b-c-', lookupFirestore);
      mocks.scan.control.scans$ = cold( 'a-b-c-', lookupScans);
      const expected$ = cold(           'a-b-c-', lookupTimestampMs);
      act(updateFirestore$, expected$, env);
    }));

    it('should use cache if cache and data used for scan calculation have the same timestamp', () => marbleRun( env => {
      const updateFirestore$ = env.hot( 'a--------b---', lookupFirestore);
      mocks.scan.control.scans$ = cold( 'a-a-d-a--b-b-', lookupScans);
      const expected$ = cold(           'a--------b---', lookupTimestampMs);
      act(updateFirestore$, expected$, env);
    }));

    it('should use cache if cache is younger then data used for scan calculation ', () => marbleRun( env => {
      const updateFirestore$ = env.hot( 'b----------', lookupFirestore);
      mocks.scan.control.scans$ = cold( 'b-a-b-b-a--', lookupScans);
      const expected$ = cold(           'b----------', lookupTimestampMs);
      act(updateFirestore$, expected$, env);
    }));

    it('should not fetch any data if currency changed', () => marbleRun( env => {
      const updateFirestore$ = env.hot( 'a-b-c--------', lookupFirestore);
      mocks.scan.control.scans$ = cold( 'a------------', lookupScans);
      mocks.user.control.user$ = cold(  'd-e-e---d----', lookupUserData);
      const expected$ = cold(           'a-a-----a---', lookupTimestampMs);
      act(updateFirestore$, expected$, env);
    }));

    it('should adapt currency', () => marbleRun( env => {
      const updateFirestore$ = env.hot( 'a------------', lookupFirestore);
      mocks.scan.control.scans$ = cold( 'a------------', lookupScans);
      mocks.user.control.user$ = cold(  'd-e-e---d----', lookupUserData);
      const expected$ = cold(           'd-e-----d----', lookupMarble2Currency);
      const currency$ = service.coins$.pipe( map( coin => coin[0].info.unit) );
      updateFirestore$.subscribe(history => {mocks.firestore.control.getResponse$ = of(history);});
      expectMarbles(currency$, expected$, env);
    }));

    it('should change price if currency changes', () => marbleRun( env => {
      const coinIdx = 2;
      const factorEur2Usd = lookupFirestore.a.meta.ratesTo$['eur'];
      const compressedMetric = lookupCoinMetric2Compression.price;
      const priceUsd = lookupFirestore.a.payload[coinIdx][compressedMetric];
      const lookupPrice: MarbleLookup<number> = {
        d: priceUsd,
        e: priceUsd * factorEur2Usd
      };
      const updateFirestore$ = env.hot( 'a------------', lookupFirestore);
      mocks.scan.control.scans$ = cold( 'a------------', lookupScans);
      mocks.user.control.user$ = cold(  'd-e-e---d----', lookupUserData);
      const expected$ = cold(           'd-e-----d----', lookupPrice);
      const price$ = service.coins$.pipe( map( coin => coin[coinIdx].snapshot.price) );
      updateFirestore$.subscribe(snapshot => {mocks.firestore.control.getResponse$ = of(snapshot);});
      expectMarbles(price$, expected$, env);
      expect(lookupPrice.d).not.toEqual(lookupPrice.e);
      expect(lookupPrice.d).not.toEqual(0);
    }));

    it('should return coin by id', () => marbleRun( env => {
      const id = assetCoin.getIds()[2];
      const updateFirestore$ = env.hot( 'a-b-c', lookupFirestore);
      mocks.scan.control.scans$ = cold( 'a-b-c', lookupScans);
      const expected$ = cold(           'a-a-a', {a: id});
      const id$ = service.getCoinByID(id).pipe(map(coin => coin.id));
      updateFirestore$.subscribe(storage => {mocks.firestore.control.getResponse$ = of(storage);});
      expectMarbles(id$, expected$, env);
    }));

    it('should skip if coin not found for a short time', () => marbleRun( env => {
      const idIdx = 2;
      const id = assetCoin.getIds()[idIdx];
      // start ugly creation of compressed without id with same timestamp
      const withoutId: Meta<CompressedStorageSnapshot> = deepCopy(lookupFirestore.b);
      withoutId.payload["New"] = {...withoutId.payload[idIdx]};
      withoutId.payload = deepCopy(withoutId.payload);
      delete withoutId.payload[idIdx];
      // finish
      const updateFirestore$ = env.hot( 'a-d-c', {...lookupFirestore, d: withoutId});
      mocks.scan.control.scans$ = cold( 'a-b-c', lookupScans);
      const expected$ = cold(           'a---a', {a: id});
      const id$ = service.getCoinByID(id).pipe(map(coin => coin.id));
      updateFirestore$.subscribe(storage => {mocks.firestore.control.getResponse$ = of(storage);});
      expectMarbles(id$, expected$, env);
    }));

  });

  describe('Update coin history', function () {

    function createCompressedHistory(): CompressedHistory  {
      const history = assetCoin.createDummyHistory(Math.random());
      return assetCoin.compressHistory(history);
    }

    function map2Timestamp(history: Meta<History<'coin'>>): number {
      return history.meta.timestampMs;
    }

    function mapTimestamp2Storage(timestamp: number): Meta<CompressedHistory> {
      return addMeta( createCompressedHistory(), createDummyMetaData(timestamp) );
    }

    const lookupFirestore: MarbleLookup<Meta<CompressedHistory>> = {
      'a': mapTimestamp2Storage(lookupTimestampMs.a) ,
      'b': mapTimestamp2Storage(lookupTimestampMs.b) ,
      'c': mapTimestamp2Storage(lookupTimestampMs.c) ,
    };

    function act(updateFirestore$, expected$, env): void {
      const timestamp$ = service.getCoinHistoryWithMetaData(changedId).pipe(map(map2Timestamp));
      updateFirestore$.subscribe(history => {mocks.firestore.control.getResponse$ = of(history);});
      expectMarbles(timestamp$, expected$, env);
    }

    it('should only fetch new data lead by scan changes (even if firestore already contain new data)', () => marbleRun( env => {
      const updateFirestore$ = env.hot( 'a-b-c-----', lookupFirestore);
      mocks.scan.control.scans$ = cold( 'a--------c', lookupScans);
      const expected$ = cold(           'a--------c', lookupTimestampMs);
      act(updateFirestore$, expected$, env);
    }));

    it('should fetch new data if cache is older then data used for scan calculation', () => marbleRun( env => {
      const updateFirestore$ = env.hot( 'a-b-c-', lookupFirestore);
      mocks.scan.control.scans$ = cold( 'a-b-c-', lookupScans);
      const expected$ = cold(           'a-b-c-', lookupTimestampMs);
      act(updateFirestore$, expected$, env);
    }));

    it('should fetch new data if no scans available', () => marbleRun( env => {
      const updateFirestore$ = env.hot( 'b-----', lookupFirestore);
      mocks.scan.control.scans$ = cold( 'e-----', lookupScans);
      const expected$ = cold(           'b-----', lookupTimestampMs);
      act(updateFirestore$, expected$, env);
    }));

    it('should use cache if cache and data used for scan calculation have the same timestamp', () => marbleRun( env => {
      const updateFirestore$ = env.hot( 'a--------b---', lookupFirestore);
      mocks.scan.control.scans$ = cold( 'a-a-d-a--b-b-', lookupScans);
      const expected$ = cold(           'a--------b---', lookupTimestampMs);
      act(updateFirestore$, expected$, env);
    }));

    it('should use cache if cache is younger then data used for scan calculation ', () => marbleRun( env => {
      const updateFirestore$ = env.hot( 'b----------', lookupFirestore);
      mocks.scan.control.scans$ = cold( 'b-a-b-b-a--', lookupScans);
      const expected$ = cold(           'b----------', lookupTimestampMs);
      act(updateFirestore$, expected$, env);
    }));

    it('should not fetch any data if currency changed', () => marbleRun( env => {
      const updateFirestore$ = env.hot( 'a-b-c--------', lookupFirestore);
      mocks.scan.control.scans$ = cold( 'a------------', lookupScans);
      mocks.user.control.user$ = cold(  'd-e-e---d----', lookupUserData);
      const expected$ = cold(           'a-a-----a---', lookupTimestampMs);
      act(updateFirestore$, expected$, env);
    }));

    it('should adapt currency', () => marbleRun( env => {
      const updateFirestore$ = env.hot( 'a------------', lookupFirestore);
      mocks.scan.control.scans$ = cold( 'a------------', lookupScans);
      mocks.user.control.user$ = cold(  'd-e-e---d----', lookupUserData);
      const expected$ = cold(           'd-e-----d----', lookupMarble2Currency);
      const currency$ = service.getCoinHistoryWithMetaData(changedId).pipe( map( coin => coin.meta.unit) );
      updateFirestore$.subscribe(history => {mocks.firestore.control.getResponse$ = of(history);});
      expectMarbles(currency$, expected$, env);
    }));

    it('should set exchange rates to be null after currency conversion applied (reuse is error prone)', () => marbleRun( env => {
      const updateFirestore$ = env.hot( 'a------------', lookupFirestore);
      mocks.scan.control.scans$ = cold( 'a------------', lookupScans);
      mocks.user.control.user$ = cold(  'd-e-e---d----', lookupUserData);
      const expected$ = cold(           'x-x-----x----', {x: null});
      const currency$ = service.getCoinHistoryWithMetaData(changedId).pipe( map( coin => coin.meta.ratesTo$) );
      updateFirestore$.subscribe(history => {mocks.firestore.control.getResponse$ = of(history);});
      expectMarbles(currency$, expected$, env);
    }));

    it('should cache multiple history streams independtly', () => marbleRun( env => {
      const changeHistoryId$ = env.hot('a------b----a------b-----c------b');
      const updateFirestore$ = env.hot('a-b-a---------c-----a------b-----', lookupFirestore);
      mocks.scan.control.scans$ = cold('a-b-a---------c-----a------b-----', lookupScans).pipe(shareReplay(1)); // have to be shared in this case
      const expected$ = cold(          'a-b----a----b-c----c-----a-b----c', lookupTimestampMs);
      const timestamp$ = changeHistoryId$.pipe(switchMap((id: string) => service.getCoinHistoryWithMetaData(id).pipe(map(map2Timestamp))));
      updateFirestore$.subscribe(history => {mocks.firestore.control.getResponse$ = of(history);});
      expectMarbles(timestamp$, expected$, env);
    }));
  });
});
