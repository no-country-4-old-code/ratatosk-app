import {Injectable, NgZone, PLATFORM_ID} from '@angular/core';
import {AngularFireAuth} from '@angular/fire/auth';
import {shareReplay} from 'rxjs/operators';
import {firebaseConfigurations} from '@shared_library/settings/firebase-projects';
import {FirebaseProjectName, LookupFirebaseConfig} from '@shared_library/datatypes/firebase-projects';

@Injectable({
  providedIn: 'root'
})
export class MultiDbFireauthService {

  constructor(private zone: NgZone) { }

  readScheduleUserAuth() {
    const f = this.createAngularAuth(firebaseConfigurations, 'SCHEDULE');
    return f.authState.pipe(
        shareReplay(1)
    );
  }

  readFromOwnAuth() {
    const f = this.createAngularAuth(firebaseConfigurations, 'USER_001');
    return f.authState.pipe(
        shareReplay(1)
    );
  }

  // private

  private createAngularAuth(config: LookupFirebaseConfig, projectId: FirebaseProjectName): AngularFireAuth {
    return new AngularFireAuth(config[projectId], projectId, PLATFORM_ID, this.zone, {}, {}, null, null, null, null);
  }
}
