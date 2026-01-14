import {MockControl} from '@test/helper-frontend/mocks/helper';
import {UserLastSelectionService} from '@app/services/user-last-selection.service';

export function buildMockControlUserLastSelection(): MockControl<UserLastSelectionService, {}> {
	const control = {};
	const mock = new UserLastSelectionService();
	return {mock, control};
}
