import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {RequestCancelPro} from '../../../../../shared-library/src/backend-interface/cloud-functions/interfaces';
import {firebaseAppCallCloudFunctionsUrl} from '@shared_library/settings/firebase-projects';

export function requestCancelProVersion(tokenId: string, setCanceled: boolean, http: HttpClient): Observable<void> {
    console.log('request cancel pro version');
    const url = `${firebaseAppCallCloudFunctionsUrl['USER_001']}/cancelPro`;
    const payload: RequestCancelPro = {token: tokenId, setCanceled};
    return http.get<void>(url, {params: payload as any});
}
