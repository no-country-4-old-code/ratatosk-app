import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {
    RequestRunAsyncScan,
    ResponseRunAsyncScan
} from '../../../../../shared-library/src/backend-interface/cloud-functions/interfaces';
import {firebaseAppCallCloudFunctionsUrl} from '@shared_library/settings/firebase-projects';

export function triggerAsyncScanCalculation(tokenId: string, http: HttpClient): Observable<ResponseRunAsyncScan> {
    const url = firebaseAppCallCloudFunctionsUrl['USER_001'] + '/runAsyncScan';
    const payload: RequestRunAsyncScan = {token: tokenId};
    return http.get<ResponseRunAsyncScan>(url, {params: payload as any});
}
