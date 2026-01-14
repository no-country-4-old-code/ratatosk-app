import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {RequestAddNewUser, ResponseAddNewUser} from '@shared_library/backend-interface/cloud-functions/interfaces';
import {map} from 'rxjs/operators';
import {firebaseAppCallCloudFunctionsUrl} from '@shared_library/settings/firebase-projects';

interface WrappedResponse {
    response: string
}

export function requestRegisterUserForApp(email: string, token: string, http: HttpClient): Observable<ResponseAddNewUser> {
    const url = `${firebaseAppCallCloudFunctionsUrl['SCHEDULE']}/registerNewUser`;
    const payload: RequestAddNewUser = {email, token};
    return http.get<WrappedResponse>(url, {params: payload as any}).pipe(
        map(obj => {
            let response: ResponseAddNewUser = {success: false, msg: 'Error in frontend. Could not parse ' + JSON.stringify(obj)};
            if (obj.response !== null) {
                response = JSON.parse(obj.response) as ResponseAddNewUser;
            }
            return response;
        })
    );
}
