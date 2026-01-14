import {Injectable, NgZone, PLATFORM_ID} from '@angular/core';
import {AngularFirestore} from '@angular/fire/firestore';
import {readBucketSnapshotCoin} from '@lib/firestore/read';
import {map} from 'rxjs/operators';
import {firebaseConfigurations} from '@shared_library/settings/firebase-projects';
import {FirebaseProjectName, LookupFirebaseConfig} from '@shared_library/datatypes/firebase-projects';


@Injectable({
  providedIn: 'root'
})
export class MultiDbFirestoreService {
  // TODO: User do not read from other databases --> Merge with firestore service which init database
  //  for current project DEMO, USER_001, USER_*** etc.

  constructor(private zone: NgZone) { }

  readScheduleUserFirestore() {
    console.log('Here ', firebaseConfigurations);
    const f = this.createAngularFirestore(firebaseConfigurations, 'SCHEDULE');
    return f
        .collection('test')
        .doc('test')
        .get()
        .pipe(
            map((data: any) => data.data())
        );
  }

  readFromOwnFirestore() {
    console.log('Here ', firebaseConfigurations);
    const f = this.createAngularFirestore(firebaseConfigurations, 'USER_001');
    return readBucketSnapshotCoin(f);
  }


    // private

  private createAngularFirestore(config: LookupFirebaseConfig, projectId: FirebaseProjectName): AngularFirestore {
    return new AngularFirestore(config[projectId], projectId, false, null, PLATFORM_ID, this.zone, null, {}, {});
  }

}
