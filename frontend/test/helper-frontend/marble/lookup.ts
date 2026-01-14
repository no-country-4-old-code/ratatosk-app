import {PermissionCheckResult, UserRole} from '@app/lib/user-role/permission-check/interfaces';
import {TimeRangeFrontend} from '@app/lib/coin/interfaces';
import {ParamMap} from '@angular/router';
import {AuthInfo} from '@app/services/auth.service';
import {Currency} from '../../../../shared-library/src/datatypes/currency';
import {lookupCurrencySymbol} from '@app/lib/coin/currency/unit';
import {AssetIdCoin, MetricCoinHistory} from '../../../../shared-library/src/asset/assets/coin/interfaces';
import {TimeRange} from '../../../../shared-library/src/datatypes/time';
import {FunctionOption} from '../../../../shared-library/src/scan/indicator-functions/interfaces';
import {CompareOption} from '../../../../shared-library/src/scan/condition/interfaces';


export interface MarbleLookup<T> {
	readonly [key: string]: T;
}

export const lookupMarble2Numbers: MarbleLookup<number> = {
	a: 0, b: 1, c: 2, d: 3, e: 4, f: 5, g: 6, h: 7
};

export const lookupMarble2CoinId: MarbleLookup<AssetIdCoin> = {
	a: 'id0', b: 'id1', c: 'id2', d: 'id3', e: 'id4', f: 'id5', g: 'id6', h: 'id7'
};

export const lookupMarble2Boolean: MarbleLookup<boolean> = {
	t: true, f: false};

export const lookupMarble2UserRole: MarbleLookup<UserRole> = {
	d: 'demo', u: 'user', p: 'pro'};

export const lookupMarble2AuthInfo: MarbleLookup<AuthInfo> = {
	a: {email: 'a@a.de', isDemo: false, uid: '0000', displayName: 'a', photoURL: null, phoneNumber: null, providerId: null, emailVerified: true,},
	b: {email: 'b@b.de', isDemo: false, uid: '1111', displayName: 'b', photoURL: null, phoneNumber: null, providerId: null, emailVerified: true,},
	d: {email: 'd@d.de', isDemo: true, uid: '3333', displayName: 'd', photoURL: null, phoneNumber: null, providerId: null, emailVerified: false}
};

export const lookupMarble2PermissionCheckResult: MarbleLookup<PermissionCheckResult> = {
	't': {isPermitted: true, reason: ''}, 'f': {isPermitted: false, reason: 'f'}};

export const lookupMarble2Attribute: MarbleLookup<MetricCoinHistory> = {
	p: 'price', r: 'rank', v: 'volume', s: 'supply', c: 'marketCap', g: 'redditScore'};

export const lookupMarble2Range: MarbleLookup<TimeRange> = {
	d: '1D', w: '1W', m: '1M', y: '1Y', a: '5Y'};

export const lookupMarble2RangeFrontend: MarbleLookup<TimeRangeFrontend> = {
	...lookupMarble2Range, h: '1H', i: '12H'};

export const lookupMarble2CompareOption: MarbleLookup<CompareOption> = {
	g: '>', l: '<', e: '<='};

export const lookupMarble2FunctionOption: MarbleLookup<FunctionOption> = {
	p: 'value', a: 'average'};

export const lookupMarble2ParamMap: MarbleLookup<Partial<ParamMap>> = {
	a: {get: (s: string) => '0'},
	b: {get: (s: string) => '1'},
	c: {get: (s: string) => 'miau'},
};

export const lookupMarble2Currency: MarbleLookup<Currency | '#'> = {
	d: 'usd', e: 'eur', b: 'dkk', r: '#'
};

export const lookupMarble2CurrencySymbol: MarbleLookup<string> = {
	d: lookupCurrencySymbol['usd'], e: lookupCurrencySymbol['eur'], b: lookupCurrencySymbol['dkk'], r: '#'
};
