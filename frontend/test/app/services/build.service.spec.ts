import {BuildService} from '@app/services/build.service';
import {expectMarbles, marbleRun} from '@test/helper-frontend/marble/functions.spec';
import {cold} from 'jasmine-marbles';
import {ScanFrontend} from '@app/lib/scan/interfaces';
import {map, skip, switchMap} from 'rxjs/operators';
import {mapScan2Frontend} from '@app/lib/firestore/mapFirestore';
import {Scan} from '../../../../shared-library/src/scan/interfaces';
import {createDummyScan, createDummyScans} from '../../../../shared-library/src/functions/test-utils/dummy-data/scan';
import {of, zip} from 'rxjs';
import {buildAllMocks, MockControlArray} from '@test/helper-frontend/mocks/all';
import {MarbleLookup} from '@test/helper-frontend/marble/lookup';
import {createDummyAuthInfo} from '@test/helper-frontend/dummy-data/auth';
import {assetCoin} from '@shared_library/asset/lookup-asset-factory';
import {createDummyScanFronted} from '@test/helper-frontend/dummy-data/view';
import {ResponseRunAsyncScan} from "@shared_library/backend-interface/cloud-functions/interfaces";


describe('BuildService', () => {
  const numberOfScans = 3;
  const newTitle = 'Miau1234';
  let newIconId: number;
  let lookupMarble2Scans: MarbleLookup<Scan>;
  let lookupMarble2Id: MarbleLookup<number | string>;
  let lookupId2Scan: MarbleLookup<ScanFrontend>;
  let scansFrontend: ScanFrontend[];
  let scanDefault: ScanFrontend;
  let mocks: MockControlArray;
  let service: BuildService;


  beforeEach(function () {
    spyOn(Math, 'random').and.returnValue(0.1); // otherwise random scan icon id will cause failures
    const maxId = 665;

    // create scans
    const scans = createDummyScans(numberOfScans, 0);
    scansFrontend = scans.map(mapScan2Frontend);
    scansFrontend[0].id = 42;
    scansFrontend[0].conditions[0].left.params.factor = 2;
    scansFrontend[1].id = maxId;
    scansFrontend[1].conditions[0].left.params.factor = 3;
    scansFrontend[2].id = 23;
    scansFrontend[2].conditions[0].left.params.factor = 4;  // TODO: Add tests to check if async scan calculation is triggered or not !

    // create service
    mocks = buildAllMocks();
    mocks.scan.control.scans$ = of(scansFrontend);
    service = new BuildService(mocks.scan.mock, mocks.auth.mock, mocks.http.mock);

    // lookup and other
    (service['delayAfterTriggerAsyncMs'] as any) = 0;   // disable sleep time
    scanDefault = service['createDefaultScanBlueprint']();
    newIconId = scanDefault.iconId + 6;

    lookupMarble2Scans = {
      a: scanDefault,
      b: scansFrontend[0],
      c: scansFrontend[1],
      d: scansFrontend[2]
    };

    lookupMarble2Id = {
      a: 'new',
      b: scansFrontend[0].id,
      c: scansFrontend[1].id,
      d: scansFrontend[2].id,
      e: undefined,
      f: NaN,
      n: maxId + 1, // new id (is expected if id is invalid)
    };

    lookupId2Scan = {
      42: scansFrontend[0],
      665: scansFrontend[1],
      23: scansFrontend[2],
    };
  });

  describe('Test startup', function () {

    it('should start with default scan', () => marbleRun( env => {
      const expected = cold('a', lookupMarble2Scans);
      const snapshot$ = service.currentBlueprint$;
      expectMarbles(snapshot$, expected, env);
    }));

  });

  describe('Test update of scan', function () {
    let lookupMarble2UpdateAttr: MarbleLookup<object>;

    beforeEach(function () {
      lookupMarble2UpdateAttr = {
        a: {iconId: newIconId},
        b: {title: newTitle}
      };
    });

    function act(update$, env) {
      update$.subscribe(update => service.update(update));
      env.flush();
    }

    it('should update only given attributes (if iconId is not changed)', () => marbleRun( env => {
      const update$ = env.hot('--b', lookupMarble2UpdateAttr);
      const result$ = service.currentBlueprint$.pipe( skip(1) );
      result$.subscribe( scan => {
        expect(scan.title).toEqual(newTitle);
        expect(scan.iconId).toEqual(scanDefault.iconId);
        expect(scan.iconPath).toEqual(scanDefault.iconPath);
        expect(scan.preSelection).toEqual(scanDefault.preSelection);
      });
      act(update$, env);
    }));

    it('should also update icon path if iconId is updated (special case)', () => marbleRun( env => {
      const update$ = env.hot('--a', lookupMarble2UpdateAttr);
      const result$ = service.currentBlueprint$.pipe(
          skip(1)
      );
      result$.subscribe( scan => {
        expect(scan.iconId).toEqual(newIconId);
        expect(scan.iconPath).not.toEqual(scanDefault.iconPath);
      });
      act(update$, env);
    }));


    it('should use updated object for further actions', () => marbleRun( env => {
      const update$ = env.hot('--a-b', lookupMarble2UpdateAttr);
      const result$ = service.currentBlueprint$.pipe( skip(2) );
      result$.subscribe( scan => {
        expect(scan.title).toEqual(newTitle);
        expect(scan.iconId).toEqual(newIconId);
        expect(scan.preSelection).toEqual(scanDefault.preSelection);
      });
      act(update$, env);
    }));
  });


  describe('Test current blueprint stream ', function () {

    beforeEach(function () {
      spyOn(mocks.scan.mock, 'getScan$').and.callFake((id) => of(lookupId2Scan[id]));
      service.currentBlueprint$.subscribe();
    });

    function getLookupChanges(attr: string): any {
      let lookupChanges: any = {a: 'foBa1234', b: scanDefault[attr], c: 'otherVal'};
      if (typeof scanDefault[attr] === typeof []) {
        lookupChanges = {a: ['foBa1234'], b: scanDefault[attr], c: ['otherVal']};
      }
      return lookupChanges;
    }

    it('should initial start with false (as long no changes occur)', () => marbleRun( env => {
      const change$ = env.hot( '--', {a: newTitle, b: scanDefault.title});
      const hasChanged$ = cold('x-').pipe( map(trigger => service.hasChanged()) );
      const expected$ = cold(  'f-', {f: false, t: true});
      change$.subscribe( title => service.update({title}));
      expectMarbles(hasChanged$, expected$, env);
    }));

    it('should detect when scan has changed from initial', () => marbleRun( env => {
      const change$ = env.hot( '--a-b-a', {a: newTitle, b: scanDefault.title});
      const hasChanged$ = cold('x-x-x-x').pipe( map(trigger => service.hasChanged()) );
      const expected$ = cold(  'f-t-f-t', {f: false, t: true});
      change$.subscribe( title => service.update({title}));
      expectMarbles(hasChanged$, expected$, env);
    }));

    it('should detect when scan has changed from loaded', () => marbleRun( env => {
      const load$ = env.hot(   'b-------c', lookupMarble2Id);
      const change$ = env.hot( '--a-b-a--', {a: newTitle, b: lookupMarble2Scans['b'].title});
      const hasChanged$ = cold('x-x-x-x-x').pipe( map(trigger => service.hasChanged()) );
      const expected$ = cold(  'f-t-f-t-f', {f: false, t: true});
      change$.subscribe( title => service.update({title}));
      load$.subscribe( id =>  service.load(id));
      expectMarbles(hasChanged$, expected$, env);
    }));

    Object.keys(createDummyScan()).forEach(attr => {
      it(`should detect any changes (${attr})`, () => marbleRun( env => {
        const lookupChanges = getLookupChanges(attr);
        const change$ = env.hot( '--a-b-a-c-a---b-', lookupChanges);
        const reset$ = cold(     '------------r---');
        const hasChanged$ = cold('x-x-x-x-x-x-x-x').pipe( map(() => service.hasChanged()) );
        const expected$ = cold(  'f-t-f-t-t-t-f-f', {f: false, t: true});
        change$.subscribe( value => { const obj: any = {}; obj[attr] = value; service.update(obj);});
        reset$.subscribe( () => service.reset());
        expectMarbles(hasChanged$, expected$, env);
      }));
    });
  });


  describe('Test reset of scan', function () {

    it('should restore default scan if reset is triggered', () => marbleRun( env => {
      service.update({title: newTitle} );
      service.update({iconId: scanDefault.iconId + 6});
      service.reset();
      service.currentBlueprint$.subscribe(scan => {
        expect(scan).toEqual(scanDefault);
      });
      env.flush();
    }));
  });


  describe('Test load of scan', function () {

    beforeEach(function () {
      spyOn(mocks.scan.mock, 'getScan$').and.callFake((id) => of(lookupId2Scan[id]));
    });

    it('should load scan from given id if valid', () => marbleRun( env => {
      const load$ = env.hot(   '--b-c-d-d-c-b-a-', lookupMarble2Id);
      const expected$ = cold(  'a-b-c-d-d-c-b-a-', lookupMarble2Scans);
      load$.subscribe( id =>  service.load(id));
      expectMarbles(service.currentBlueprint$, expected$, env);
    }));

    it('should create new default scan if id is invalid', () => marbleRun( env => {
      const load$ = env.hot(   '--b-e-a-f', lookupMarble2Id);
      const expected$ = cold(  'a-b-a-a-a', lookupMarble2Scans);
      load$.subscribe( id =>  service.load(id));
      expectMarbles(service.currentBlueprint$, expected$, env);
    }));
  });


  describe('Test save of scan ', function () {
    const tokenId = 'alice';
    let httpReturnObj: ResponseRunAsyncScan;
    let titles: string[];
    let spyHttp: jasmine.Spy;

    beforeEach(function () {
      httpReturnObj = {success: true, msg: 'Miau miau error'};
      spyHttp = spyOn(mocks.http.mock, 'get').and.returnValue(of(httpReturnObj));
      spyOn(mocks.auth.mock, 'getTokenId$').and.returnValue(of(tokenId));
      mocks.auth.control.authUserInfo$ = of({...createDummyAuthInfo('miau'), tokenId});
      titles = scansFrontend.map(scan => scan.title);
      service.currentBlueprint$.subscribe();
      service.update({title: newTitle});
    });


    describe('Call of internal scan save', function () {

      it('should save the updated scan', () => marbleRun( env => {
        const lookupTitle = {a: newTitle, b: 'wuff', c: 'miau'};
        const updateTrigger$ = env.hot('-a-b-c', lookupTitle);
        const expectedTitle$ = cold(   '-a-b-c', lookupTitle);
        const updatedTitle$ = mocks.scan.control.paramsOfScanUpdate$.pipe( map(scan => scan.title ));
        updateTrigger$.pipe(
            switchMap((title: string) => {
              service.update({...createDummyScan(), title});
              return service.save();})
        ).subscribe();
        expectMarbles(updatedTitle$, expectedTitle$, env);
      }));

      it('should return id of written scan', () => marbleRun( env => {
        const saveId$ = env.hot('-b-c-d', lookupMarble2Id);
        const expected$ = cold( '-b-c-d', lookupMarble2Id);
        const save$ = saveId$.pipe( switchMap((id: number) => service.save(id)) );
        expectMarbles(save$, expected$, env);
      }));

      it('should not use "new" as id', () => marbleRun( env => {
        const saveId$ = env.hot('-a-b-b-a', lookupMarble2Id);
        const expected$ = cold( '-n-b-b-n', lookupMarble2Id);
        const save$ = saveId$.pipe( switchMap((id: number) => service.save(id)) );
        expectMarbles(save$, expected$, env);
      }));

      it('should calculate new id if invalid id is given', () => marbleRun( env => {
        const saveId$ = env.hot('-a-e-f', lookupMarble2Id);
        const expected$ = cold( '-n-n-n', lookupMarble2Id);
        const save$ = saveId$.pipe( switchMap((id: number) => service.save(id)) );
        expectMarbles(save$, expected$, env);
      }));

      it('should return the id which is used to call the save method of the scan service', () => marbleRun( env => {
        const saveId$ = env.hot('-b-c-d---d-c-b-', lookupMarble2Id);
        const idReturned$ = saveId$.pipe( switchMap((id: number) => service.save(id)) );
        const idUpdated$ = mocks.scan.control.paramsOfScanUpdate$.pipe( map(scan => scan.id ));
        zip(idReturned$, idUpdated$).pipe(
            map(([idReturned, idUpdated]) => {
              expect(idReturned).toEqual(idUpdated);
            })
        ).subscribe();
        env.flush();
      }));
    });

    describe('Trigger async scan calculation on save of scan', function () {

      it('should trigger async scan calculation on save', () => marbleRun( env => {
        const saveId$ = env.hot('-c', lookupMarble2Id);
        const save$ = saveId$.pipe( switchMap((id: number) => service.save(id)) );
        save$.subscribe();
        env.flush();
        expect(spyHttp).toHaveBeenCalledTimes(1);
        expect(spyHttp.calls.argsFor(0)[1].params).toEqual({token: tokenId});
      }));

      it('should retry up to 2 times if request was not successful', () => marbleRun( env => {
        httpReturnObj.success = false;
        const saveId$ = env.hot('-c', lookupMarble2Id);
        const save$ = saveId$.pipe( switchMap((id: number) => service.save(id)) );
        save$.subscribe();
        env.flush();
        expect(spyHttp).toHaveBeenCalledTimes(3);
        expect(spyHttp.calls.argsFor(0)[1].params).toEqual({token: tokenId});
        expect(spyHttp.calls.argsFor(1)[1].params).toEqual({token: tokenId});
        expect(spyHttp.calls.argsFor(2)[1].params).toEqual({token: tokenId});
      }));

      it('should trigger async scan calculation multiple times on multiple saves (3 times)', () => marbleRun( env => {
        const saveId$ = env.hot('-c-b-d', lookupMarble2Id);
        const save$ = saveId$.pipe( switchMap((id: number) => service.save(id)) );
        save$.subscribe();
        env.flush();
        expect(spyHttp).toHaveBeenCalledTimes(3);
        expect(spyHttp.calls.argsFor(0)[1].params).toEqual({token: tokenId});
      }));
    });

    describe('Reset of scan calculations after scan update', function () {

      function act(scanToUpdate: ScanFrontend, env): ScanFrontend {
        const id = 42;
        const spyUpdate = spyOn(mocks.scan.mock, 'updateScan').and.callThrough();
        scanToUpdate.id = id;
        mocks.scan.control.scans$ = of([scanToUpdate]);
        spyOn(mocks.scan.mock, 'getScan$').and.callFake((id) => of(scanToUpdate));
        service.load(id);
        service.update({conditions: []}); // TODO: need to change scan to Update to trigger update and async
        service.save(id).subscribe();
        env.flush();
        expect(spyUpdate).toHaveBeenCalledTimes(1);
        return spyUpdate.calls.argsFor(0)[0] as ScanFrontend;
      }

      it('should reset last calculated timestamp to 0', () => marbleRun( env => {
        const timestamp = 123456;
        const scan: ScanFrontend = {...createDummyScanFronted(), timestampResultData: timestamp};
        const updatedScan = act(scan, env);
        expect(updatedScan.timestampResultData).toEqual(0);
        expect(scan.timestampResultData).toEqual(timestamp);
      }));

      it('should reset calculation result to []', () => marbleRun( env => {
        const ids = assetCoin.getIds();
        const scan: ScanFrontend = {...createDummyScanFronted(), result: ids};
        const updatedScan = act(scan, env);
        expect(updatedScan.result).toEqual([]);
        expect(scan.result).toEqual(ids);
      }));

      it('should reset last seen ids to []', () => marbleRun( env => {
        const ids = assetCoin.getIds();
        const scan: ScanFrontend = createDummyScanFronted();
        scan.notification.lastSeen = [...ids];
        const updatedScan = act(scan, env);
        expect(updatedScan.notification.lastSeen).toEqual([]);
        expect(scan.notification.lastSeen).toEqual(ids);
      }));

      it('should reset last seen ids to []', () => marbleRun( env => {
        const ids = assetCoin.getIds();
        const scan: ScanFrontend = createDummyScanFronted();
        scan.notification.lastNotified = [...ids];
        const updatedScan = act(scan, env);
        expect(updatedScan.notification.lastNotified).toEqual([]);
        expect(scan.notification.lastNotified).toEqual(ids);
      }));

    });

    describe('Calculation of scan id', function () {

      function act(existingScans: ScanFrontend[], expectedIdOfNewScan: number, env, overwriteId?: number | string): void {
        const spyUpdate = spyOn(mocks.scan.mock, 'updateScan').and.callThrough();
        mocks.scan.control.scans$ = of([...existingScans]);
        service.save().subscribe();
        env.flush();
        const updatedScan = spyUpdate.calls.argsFor(0)[0] as ScanFrontend;
        expect(updatedScan.id).toEqual(expectedIdOfNewScan);
      }

      it('should use id 0 if no other scan exist', () => marbleRun( env => {
        act([], 0, env);
      }));

      it('should use id 1 if maximal available id is 0', () => marbleRun( env => {
        const scans = [{...createDummyScanFronted(), id: 0}];
        act(scans, 1, env);
      }));

      it('should use id 6 if maximal available id is 5', () => marbleRun( env => {
        const scans = [{...createDummyScanFronted(), id: 2}, {...createDummyScanFronted(), id: 5}, {...createDummyScanFronted(), id: 0}];
        act(scans, 6, env);
      }));
    });

  });
});
