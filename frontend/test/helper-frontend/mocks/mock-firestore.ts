import {Observable, of} from 'rxjs';
import {fromControl, MockControl} from '@test/helper-frontend/mocks/helper';
import {AngularFirestore} from '@angular/fire/firestore';
import {map} from 'rxjs/operators';

export interface MockControlFirestore {
	valueChanges$: Observable<any>;
	updateResponse$: Observable<boolean>;
	getResponse$: Observable<any>;
}

export function buildMockControlFirestore(): MockControl<AngularFirestore, MockControlFirestore> {
	const control = {valueChanges$: of(null), updateResponse$: of(null), getResponse$: of(null)};
	const docObj = {
		valueChanges: () => fromControl(() => control.valueChanges$),
		update: (data) => fromControl(() => control.updateResponse$),
		get: () => fromControl(() => control.getResponse$.pipe(map(response => ({data: () => response})))),
		collection: undefined
	};
	const collectionObj = {
		doc: (doc: string) => docObj
	};
	docObj.collection = (collect: string) => collectionObj;
	const mock = {
		collection: (collect: string) => collectionObj
	} as any as AngularFirestore;
	return {mock, control};
}
