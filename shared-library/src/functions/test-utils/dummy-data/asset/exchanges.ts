import {getCoinExchanges} from '../../../../asset/assets/coin/helper/get-exchanges';

export function getTestCoinExchanges(seed: number): string[] {
    const exchanges = getCoinExchanges();
    const testCombinations = [
        [exchanges[0]],
        [exchanges[1], exchanges[0]],
        [exchanges[2], exchanges[1]],
        [exchanges[3]],
    ];
    return testCombinations[seed % testCombinations.length];
}