import {MockControl} from '@test/helper-frontend/mocks/helper';
import {RouteInfoService} from '@app/services/route-info.service';

export function buildMockControlRouteInfo(): MockControl<RouteInfoService, {}> {
	const control = {};
	const mock = {
		initUrl: '',
		previousUrl: ''
	} as RouteInfoService;
	return {mock, control};
}
