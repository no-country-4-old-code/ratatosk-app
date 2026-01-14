import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {RequestUserToken} from '../../../../../shared-library/src/backend-interface/cloud-functions/interfaces';
import {firebaseAppCallCloudFunctionsUrl} from '@shared_library/settings/firebase-projects';

export function requestRewardFeedback(tokenId: string, http: HttpClient): Observable<void> {
    console.log('request reward feedback');
    const url = `${firebaseAppCallCloudFunctionsUrl['USER_001']}/handleFeedback`;
    const payload: RequestUserToken = {token: tokenId};
    return http.get<void>(url, {params: payload as any});
}
