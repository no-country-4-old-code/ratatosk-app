import {PreSelectionBlueprint} from '../../../src/scan/pre-selection/interfaces';
import {filterByPreselection} from '../../../src/scan/pre-selection/filter';
import {lookupAssetFactory} from '../../../src/asset/lookup-asset-factory';

describe('Test pre selection filter functions', function () {

    describe('Simple select', function () {
        const asset = lookupAssetFactory['coin'];

        function act(data: string[], expected: string[], selection: string[]): void {
            const blueprint: PreSelectionBlueprint<any> = asset.createDefaultPreSelection();
            blueprint.manual = selection;
            const result = filterByPreselection(data, blueprint, 'coin');
            expect(result).toEqual(expected);
        }

        it('should return empty array if empty array given', function () {
            act([], [], ['bitcoin']);
        });

        it('should return selected element', function () {
            act(['bitcoin'], ['bitcoin'], ['bitcoin']);
        });

        it('should return elements which are in given selection', function () {
            const selection = ['bitcoin', 'ethereum', 'dogecoin'];
            const data = ['id3', 'ethereum', 'dogecoin', 'id0', 'id1'];
            const expected = ['ethereum', 'dogecoin'];
            act(data, expected, selection);
        });
    });
});
