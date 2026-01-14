import {marbleRun} from '@test/helper-frontend/marble/functions.spec';
import {UserService} from '@app/services/user.service';
import {cold} from 'jasmine-marbles';
import {createDummyAuthInfo} from '@test/helper-frontend/dummy-data/auth';
import {createDummyUserData} from '../../../../shared-library/src/functions/test-utils/dummy-data/user';
import {buildAllMocks, MockControlArray} from '@test/helper-frontend/mocks/all';
import {compressUser} from '@shared_library/functions/compress/compress-user';


describe('Test user service', () => {
	let mocks: MockControlArray;
	const lookupAuth = {a: createDummyAuthInfo('123'), b: createDummyAuthInfo('456'), c: null};
	const lookupUserData = {a: createDummyUserData(3, 0), b: createDummyUserData(2, 10)};
	const lookupUserDataCompressed = {a: compressUser(lookupUserData.a), b: compressUser(lookupUserData.b)};
	const lookupUpdate = {a: true};

	let service: UserService;

	beforeEach(() => {
		mocks = buildAllMocks();
		mocks.auth.control.authUserInfo$ = cold('a------', lookupAuth);
		service = new UserService(mocks.firestore.mock, mocks.auth.mock);
	});

	it('should fetch user data from firestore if logged in', () => marbleRun( env => {
	  mocks.firestore.control.valueChanges$ = cold('a--', lookupUserDataCompressed);
	  const expected$ = cold(                      'a--', lookupUserData);
	  env.expectObservable(service.user$).toBe(expected$.marbles, expected$.values);
	}));

	describe('Test user data change from server side', function () {

		it('should update user data if firestore user data changed', () => marbleRun( env => {
			mocks.firestore.control.valueChanges$ = cold('a-b-b-a', lookupUserDataCompressed);
			const expected$ = cold(                      'a-b-b-a', lookupUserData);
			env.expectObservable(service.user$).toBe(expected$.marbles, expected$.values);
		}));

	});

	describe('Test user data change from app ', function () {

		function triggerUpdate() {
			service.updateUserData(createDummyUserData(5, 666)).subscribe();
		}

		it('should stay alive even if update user data fails', () => marbleRun( env => {
			mocks.firestore.control.updateResponse$ = cold( '-#', lookupUpdate);
			mocks.firestore.control.valueChanges$ = cold('a-b-b-a', lookupUserDataCompressed); // changes are manually triggered for test reasons
			const trigger$ = env.hot(                    '-t---t-').subscribe(x => triggerUpdate());
			const expected$ = cold(                      'a-b-b-a', lookupUserData);
			env.expectObservable(service.user$).toBe(expected$.marbles, expected$.values);
		}));

	});

	describe('Test authentication', function () {

		it('should fetch new user data from firestore if user changes', () => marbleRun( env => {
			const collectionMockObj = mocks.firestore.mock.collection('');
			const spy = spyOn(collectionMockObj, 'doc').and.callThrough();
			mocks.auth.control.authUserInfo$ = cold(			'a-b-a-', lookupAuth);
			mocks.firestore.control.valueChanges$ = cold(	'a-----', lookupUserDataCompressed);
			const expected$ = cold(                      	'a-a-a-', lookupUserData);
			const furtherExpectations = env.hot(         	'-----a').subscribe(trig => {
				expect(collectionMockObj.doc).toHaveBeenCalledTimes(3);
				expect(spy.calls.allArgs()).toEqual([['123'], ['456'], ['123']]);});
			env.expectObservable(service.user$).toBe(expected$.marbles, expected$.values);
		}));
	});
});
