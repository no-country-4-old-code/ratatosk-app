import {MockControl} from '@test/helper-frontend/mocks/helper';
import {BuildConditionService} from "@app/services/build-condition.service";

export function buildMockControlBuildConditions(): MockControl<BuildConditionService, {}> {
	const control = {};
	const mock = {
		reset: () => {} // use spyOn(..) to count calls
	} as BuildConditionService;
	return {mock, control};
}
