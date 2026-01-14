import {AuthInfo} from '@app/services/auth.service';

export function createDummyAuthInfo(uid: string, seed= 1, updated: Partial<AuthInfo>= {}): AuthInfo {
	const nameFromId = 'name_' + seed.toString();
	const auth = {
		uid,
		email: nameFromId,
		tokenId: nameFromId,
		providerId: nameFromId,
		displayName: nameFromId,
		phoneNumber: nameFromId,
		photoURL: nameFromId,
		isDemo: false,
		emailVerified: true
	};
	return {...auth, ...updated};
}
