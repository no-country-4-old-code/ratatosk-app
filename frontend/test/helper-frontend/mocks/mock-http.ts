import {Observable, of, Subject} from 'rxjs';
import {fromControl, MockControl} from '@test/helper-frontend/mocks/helper';
import {HttpClient} from '@angular/common/http';
import {ResponseRunAsyncScan} from '../../../../shared-library/src/backend-interface/cloud-functions/interfaces';

type ParamsGet = {url: string; params: any};

export interface MockControlHttp {
	response$: Observable<ResponseRunAsyncScan>;
	readonly called$: Observable<ParamsGet>;
}


export function buildMockControlHttpClient(): MockControl<HttpClient, MockControlHttp> {
	const subjectCalled = new Subject<ParamsGet>();
	const control = {response$: of(null), called$: subjectCalled.asObservable()};
	const mock = {
		get: (url, params) => {
			console.log('req ', url);
			subjectCalled.next({url, params});
			return fromControl(() => control.response$);}
	} as HttpClient;
	return {mock, control};
}
