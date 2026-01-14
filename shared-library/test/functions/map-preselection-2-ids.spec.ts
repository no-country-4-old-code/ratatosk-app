import {lookupAssetFactory} from '../../src/asset/lookup-asset-factory';
import {PreSelectionBlueprint} from '../../src/scan/pre-selection/interfaces';
import {createDummyScan} from '../../src/functions/test-utils/dummy-data/scan';
import {AssetId} from '../../src/datatypes/data';
import {getCoinCategories} from '../../src/asset/assets/coin/helper/get-categories';
import {mapPreselection2Ids} from '../../src/functions/map-preselection-2-ids';

describe('Test mapping of preselection blueprint to ids', function () {

    describe('Test for coin', function () {
        let blueprint: PreSelectionBlueprint<'coin'>;
        const asset = lookupAssetFactory['coin'];
        let idsAll: AssetId<'coin'>[];

        beforeEach(function () {
            blueprint = createDummyScan().preSelection;
            idsAll = asset.getIds();
        });

        function act(blueprint: PreSelectionBlueprint<'coin'>, expected: AssetId<'coin'>[]): void {
            const result = mapPreselection2Ids(blueprint, 'coin');
            expect(result).toEqual(expected);
        }

        it('should return all ids if all manual and all categories ok', function () {
            blueprint.manual = asset.getIds();
            blueprint.categories = getCoinCategories();
            act(blueprint, idsAll);
        });

        it('should return no id if no manual but all categories ok', function () {
            blueprint.manual = [];
            blueprint.categories = getCoinCategories();
            act(blueprint, []);
        });

        it('should return no id if all manual but no category ok', function () {
            blueprint.manual = asset.getIds();
            blueprint.categories = [];
            act(blueprint, []);
        });

        it('should return all ids which are in manual and category [first]', function () {
            blueprint.manual = idsAll.slice(0, 5);
            blueprint.categories = ['Cryptocurrency'];
            act(blueprint, ['bitcoin']);
        });

        it('should return all ids which are in manual and category [second]', function () {
            blueprint.manual = idsAll.slice(0, 5);
            blueprint.categories = ['Smart Contract Platform'];
            act(blueprint, ['ethereum', 'binancecoin']);
        });

        it('should return all ids which are in manual and category [both]', function () {
            blueprint.manual = idsAll.slice(0, 5);
            blueprint.categories = ['Cryptocurrency', 'Smart Contract Platform'];
            act(blueprint, ['bitcoin', 'ethereum', 'binancecoin']);
        });

        it('should return all ids which are in manual [not second] and category [both]', function () {
            blueprint.manual = [idsAll[0], idsAll[3], idsAll[4]];
            blueprint.categories = ['Cryptocurrency', 'Smart Contract Platform'];
            act(blueprint, ['bitcoin', 'binancecoin']);
        });
    });

});