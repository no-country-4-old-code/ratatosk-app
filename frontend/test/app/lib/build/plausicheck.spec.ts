import {BuildCategory, runPlausibilityChecks} from '@app/lib/build/plausibility-checks';
import {BuildService} from '@app/services/build.service';
import {ScanFrontend} from '@app/lib/scan/interfaces';
import {
    createDummyConditionAlwaysTrue
} from '../../../../../shared-library/src/functions/test-utils/dummy-data/condition';
import {createRangeArray} from '../../../../../shared-library/src/functions/general/array';
import {maxNumberOfConditions} from '@shared_library/scan/settings';
import {lookupAssetFactory} from '@shared_library/asset/lookup-asset-factory';

describe('Test build plausibility checks', function () {
    let scan: ScanFrontend;

    function expectErrorMsg(selectedScan: ScanFrontend, numberOfErrMsg: number, category: BuildCategory) {
        const errors = runPlausibilityChecks(selectedScan);
        console.log(errors);
        expect(errors.length).toEqual(numberOfErrMsg);
        errors.forEach(error => expect(error.category).toEqual(category));
    }

    beforeEach(function () {
        scan = new BuildService(null, null, null)['createDefaultScanBlueprint']();
    });

    it('should run on default scan without failures', () => {
        expectErrorMsg(scan, 0, '' as BuildCategory);
    });

    describe('Test title checks', function () {
        const category: BuildCategory = 'Title';

        it('should detect empty title', () => {
            scan.title = '';
            expectErrorMsg(scan, 1, category);
        });

        it('should detect too long title', () => {
            scan.title = '123456789-123456789-123456789-123456789-123';
            expectErrorMsg(scan, 1, category);
        });
    });

    describe('Test pre-selection checks', function () {
        const category: BuildCategory = 'Preselection';

        it('should detect no coins preselected', () => {
            scan.preSelection = lookupAssetFactory['coin'].createDefaultPreSelection();
            scan.preSelection.manual = [];
            expectErrorMsg(scan, 1, category);
        });
    });

    describe('Test condition checks', function () {
        const category: BuildCategory = 'Conditions';

        it('should detect if number of conditions exceed maximum', () => {
            scan.conditions = createRangeArray(maxNumberOfConditions + 1).map(ele => createDummyConditionAlwaysTrue());
            expectErrorMsg(scan, 1, category);
        });

        it('should allow if number of conditions is equal maximum', () => {
            scan.conditions = createRangeArray(maxNumberOfConditions).map(ele => createDummyConditionAlwaysTrue());
            expectErrorMsg(scan, 0, '' as BuildCategory);
        });

    });

});
