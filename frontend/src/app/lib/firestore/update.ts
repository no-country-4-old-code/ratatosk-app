import {AngularFirestore} from '@angular/fire/firestore';
import {UserData} from '../../../../../shared-library/src/datatypes/user';
import {from, Observable} from 'rxjs';
import {getDocUser} from '../../../../../shared-library/src/backend-interface/firestore/documents';
import {compressUser} from '@shared_library/functions/compress/compress-user';
import firebase from 'firebase/app';
import 'firebase/firestore';

export function updateStorageUser(data: Partial<UserData>, firestore: AngularFirestore, userId: string): Observable<any> {
    const dataWithTimestamp: Partial<UserData> = {
        ...data,
        lastUserActivity: firebase.firestore.FieldValue.serverTimestamp()
    };
    const compressed = compressUser(dataWithTimestamp);
    return from(getDocUser(firestore, userId).update(compressed));
}
