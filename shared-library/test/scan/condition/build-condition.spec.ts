import {buildCondition} from '../../../src/scan/condition/build-condition';
import {CompareOption, ConditionBlueprint} from '../../../src/scan/condition/interfaces';
import {createDummyConditionSpecific} from '../../../src/functions/test-utils/dummy-data/condition';
import {assetCoin} from '../../../src/asset/lookup-asset-factory';
import {History} from '../../../src/datatypes/data';


describe('Test build conditions', function () {
    let history: History<'coin'>;

    function getValidBlueprint(): ConditionBlueprint<'coin'> {
        const params1 = {factor: 1};
        const params2 = {factor: 2};
        return createDummyConditionSpecific(
            'value', params1, '<', 'value', params2);
    }

    beforeEach(function () {
        history = assetCoin.createDummyHistory(10);
    });

    it('should create a function (always true) with valid blueprint', function () {
        const valid = getValidBlueprint();
        const compare = buildCondition(valid);
        expect(compare(history)).toBeTruthy();
    });

    it('should create a function (always false) with valid blueprint', function () {
        const valid = getValidBlueprint();
        valid.compare = '>';
        const compare = buildCondition(valid);
        expect(compare(history)).toBeFalsy();
    });

    it('should throw error if compare func is invalid', function () {
        const invalid = getValidBlueprint();
        invalid.compare = '<>' as CompareOption;
        expect(() => buildCondition(invalid)).toThrowError();
    });

    it('should return false if history is empty', function () {
        history = assetCoin.createEmptyHistory();
        const valid = getValidBlueprint();
        const compare = buildCondition(valid);
        expect(compare(history)).toBeFalsy();
    });
});
