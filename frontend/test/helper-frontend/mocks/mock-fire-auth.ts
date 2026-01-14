import {Observable, of} from 'rxjs';
import {fromControl, MockControl} from '@test/helper-frontend/mocks/helper';
import {AngularFireAuth} from '@angular/fire/auth';
import firebase from 'firebase/app';
import 'firebase/auth';

export interface MockControlFireAuth {
	authState$: Observable<firebase.User | null>;
}

export function buildMockControlFireAuth(): MockControl<AngularFireAuth, MockControlFireAuth> {
	const control = {authState$: of(null)};
	const mock = {
		authState: fromControl(() => control.authState$),
	} as any as AngularFireAuth;
	return {mock, control};
}
