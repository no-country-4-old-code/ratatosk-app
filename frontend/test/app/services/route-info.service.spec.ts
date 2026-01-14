import {buildAllMocks, MockControlArray} from '@test/helper-frontend/mocks/all';
import {marbleRun} from '@test/helper-frontend/marble/functions.spec';
import {RouteInfoService} from '@app/services/route-info.service';
import {MarbleLookup} from '@test/helper-frontend/marble/lookup';
import {cold} from 'jasmine-marbles';

describe('RouteInfoService', function () {
	const lookup: MarbleLookup<string> = {a: 'menu/scans', b: 'uff/ta/ta', c: ''};
	let service: RouteInfoService;
	let mocks: MockControlArray;

	beforeEach(function () {
		mocks = buildAllMocks();
		service = new RouteInfoService(mocks.location.mock);
	});

	describe('Test previous url', function () {

		it('should start with empty url', function () {
			expect(service.previousUrl).toEqual('');
		});

		it('should update previous location on change', () => marbleRun(env => {
			const url$ = env.hot(		'a-b-b-a----c-b-a-', lookup);
			const expected$ = cold(	'---a-a-b----a-c-b', lookup);
			url$.subscribe(url => mocks.location.control.changeUrl(url, undefined));
			expected$.subscribe( url => expect(service.previousUrl).toEqual(url));
			env.flush();
		}));
	});
});
