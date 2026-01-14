import {getHistoryDependencyOfScans} from '../../src/helper/get-history-dependency';
import {createEmptyScan} from '../../../../../shared-library/src/functions/test-utils/dummy-data/scan';
import {createRangeArray} from '../../../../../shared-library/src/functions/general/array';
import {
    createDummyConditionAlwaysFalse,
    createDummyConditionAlwaysTrue
} from '../../../../../shared-library/src/functions/test-utils/dummy-data/condition';

import {AssetType} from '../../../../../shared-library/src/asset/interfaces-asset';

describe('Test extraction of needed history of scans for calculation', function () {
    const asset: AssetType = 'coin';

    it('should return empty array if no searches given', function () {
        const result = getHistoryDependencyOfScans([]);
        expect(result).toEqual([]);
    });

    it('should list asset and attribute of history needed by condition (1 given)', function () {
        const searches = createRangeArray(1).map(() => createEmptyScan());
        const condition = createDummyConditionAlwaysTrue();
        condition.metric = 'price';
        searches[0].conditions = [condition];
        const result = getHistoryDependencyOfScans(searches);
        expect(result).toEqual([{metric: 'price', asset}]);
    });

    it('should list attribute if needed by at least one condition (1 given)', function () {
        const searches = createRangeArray(1).map(() => createEmptyScan());
        const condition1 = createDummyConditionAlwaysTrue();
        const condition2 = createDummyConditionAlwaysTrue();
        condition1.metric = 'price';
        condition2.metric = 'supply';
        searches[0].conditions = [condition1, condition2];
        const result = getHistoryDependencyOfScans(searches);
        expect(result).toEqual([{metric: 'price', asset}, {metric: 'supply', asset}]);
    });

    it('should list asset if needed by at least one condition (1 given)', function () {
        const searches = createRangeArray(1).map(() => createEmptyScan());
        const condition = createDummyConditionAlwaysTrue();
        condition.metric = 'supply';
        searches[0].conditions = [condition];
        const result = getHistoryDependencyOfScans(searches);
        expect(result).toEqual([{metric: 'supply', asset}]);
    });

    it('should list every combination of asset & attribute only once', function () {
        const searches = createRangeArray(2).map(() => createEmptyScan());
        const condition = createDummyConditionAlwaysTrue();
        const condition2 = createDummyConditionAlwaysFalse();
        const condition3 = createDummyConditionAlwaysFalse();
        condition.metric = 'supply';
        condition2.metric = 'price';
        condition3.metric = 'rank';
        searches[0].conditions = [condition, condition, condition2];
        searches[1].conditions = [condition, condition2, condition, condition, condition3];
        const result = getHistoryDependencyOfScans(searches);
        expect(result).toEqual([{metric: 'supply', asset}, {metric: 'price', asset}, {metric: 'rank', asset}]);
    });

    it('should return handle advanced attributes', function () {
        const searches = createRangeArray(1).map(() => createEmptyScan());
        const condition = createDummyConditionAlwaysTrue();
        condition.metric = 'redditScore';
        searches[0].conditions = [condition];
        const result = getHistoryDependencyOfScans(searches);
        expect(result).toEqual([{metric: 'redditScore', asset}]);
    });

    xit('should return handle different assets', function () {
        const fakeAsset: AssetType = 'huhu' as AssetType;
        const searches = createRangeArray(2).map(() => createEmptyScan());
        const condition = createDummyConditionAlwaysTrue();
        condition.metric = 'price';
        searches[0].asset = fakeAsset;
        searches[0].conditions = [condition];
        searches[1].conditions = [condition];
        const result = getHistoryDependencyOfScans(searches);
        expect(result).toEqual([{metric: 'price', asset: fakeAsset}, {metric: 'price', asset}]);
    });

    it('should return handle market cap (in old architecture it was packed)', function () {
        const searches = createRangeArray(1).map(() => createEmptyScan());
        const condition = createDummyConditionAlwaysTrue();
        condition.metric = 'marketCap';
        searches[0].conditions = [condition];
        const result = getHistoryDependencyOfScans(searches);
        expect(result).toEqual([{metric: 'marketCap', asset}]);
    });

});
