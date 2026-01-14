import {getCoinCategories} from '../../../../asset/assets/coin/helper/get-categories';

export function getTestCategories(seed: number): string[] {
    const categories = getCoinCategories();
    const testCombinations = [
        [categories[0]],
        [categories[1], categories[0]],
        [categories[2], categories[1]],
        [categories[3]],
    ];
    return testCombinations[seed % testCombinations.length];
}