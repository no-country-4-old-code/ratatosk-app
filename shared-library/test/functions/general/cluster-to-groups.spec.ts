import {cluster2Groups} from '../../../src/functions/general/cluster-to-groups';

describe('Test clustering values to groups', function () {

    function act(groupSize: number, values: string[], expected: string[][]): void {
        const result = cluster2Groups(values, groupSize);
        expect(result).toEqual(expected);
    }

    it('should cluster values of array to sub-arrays with a maximal given size', function () {
        act(1, [], []);
        act(1, ['a'], [['a']]);
        act(1, ['a', 'b'], [['a'], ['b']]);
        act(1, ['a', 'b', 'c', 'd', 'e', 'f'], [['a'], ['b'], ['c'], ['d'], ['e'], ['f']]);
        act(2, ['a', 'b', 'c', 'd', 'e', 'f'], [['a', 'b'], ['c', 'd'], ['e', 'f']]);
        act(3, ['a', 'b', 'c', 'd', 'e', 'f'], [['a', 'b', 'c'], ['d', 'e', 'f']]);
        act(4, ['a', 'b', 'c', 'd', 'e', 'f'], [['a', 'b', 'c', 'd'], ['e', 'f']]);
        act(5, ['a', 'b', 'c', 'd', 'e', 'f'], [['a', 'b', 'c', 'd', 'e'], ['f']]);
        act(6, ['a', 'b', 'c', 'd', 'e', 'f'], [['a', 'b', 'c', 'd', 'e', 'f']]);
        act(7, ['a', 'b', 'c', 'd', 'e', 'f'], [['a', 'b', 'c', 'd', 'e', 'f']]);
        act(100, ['a', 'b', 'c', 'd', 'e', 'f'], [['a', 'b', 'c', 'd', 'e', 'f']]);
    });

});