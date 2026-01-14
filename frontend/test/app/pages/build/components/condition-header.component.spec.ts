import {ConditionHeaderComponent} from '@app/pages/build-scan/_components/condition-header/condition-header.component';
import {expectMarbles, marbleRun} from '@test/helper-frontend/marble/functions.spec';
import {cold} from 'jasmine-marbles';
import {lookupMarble2CompareOption, MarbleLookup} from '@test/helper-frontend/marble/lookup';
import {
    createDummyConditionAlwaysTrue
} from '../../../../../../shared-library/src/functions/test-utils/dummy-data/condition';
import {map} from 'rxjs/operators';
import {ConditionBlueprint} from '../../../../../../shared-library/src/scan/condition/interfaces';

describe('ConditionHeaderComponent', function () {
    let component: ConditionHeaderComponent;

    beforeEach(function () {
        component = new ConditionHeaderComponent();
    });

    describe('Test info stream', function () {
        const baseCondition = createDummyConditionAlwaysTrue();
        const lookupCondition: MarbleLookup<ConditionBlueprint<'coin'>> = {
            g: {...baseCondition, compare: lookupMarble2CompareOption.g},
            l: {...baseCondition, compare: lookupMarble2CompareOption.l},
            u: undefined
        };
        const lookupMarpe2CompareOptionText: MarbleLookup<string> = {
            g: `should be <b>${lookupMarble2CompareOption.g}</b> than`,
            l: `should be <b>${lookupMarble2CompareOption.l}</b> than`,
        };



        it('should update on change of info', () => marbleRun(env => {
            const trigger$ = env.hot('g-l-g-u', lookupCondition);
            const expected$ = cold('g-l-g--', lookupMarpe2CompareOptionText);
            const compare$ = component.info$.pipe(map(info => info.compare));
            trigger$.subscribe(condition => (component as any).subjectInfo.next(condition));
            expectMarbles(compare$, expected$, env);
        }));
    });

    describe('Test sample stream', function () {

    });
});
