import {Scan} from '../../../../../../../shared-library/src/scan/interfaces';
import {filterByPreselection} from '../../../../../../../shared-library/src/scan/pre-selection/filter';
import {AssetIdCoin} from '../../../../../../../shared-library/src/asset/assets/coin/interfaces';
import {HistoryWithId} from '../../../../../../../shared-library/src/datatypes/data';
import {AssetDatabase} from './interfaces';
import {ConditionBlueprint} from '../../../../../../../shared-library/src/scan/condition/interfaces';
import {buildCondition} from '../../../../../../../shared-library/src/scan/condition/build-condition';

export function updateScans(scans: Scan[], database: AssetDatabase): Scan[] {
    const results = runScans(scans, database);
    return scans.map((scan, idx) => {
        // TODO: Here we could spare some memory !! -> only add scan id for e.g ? Arg.. could I update a list ?!? fuuu
        return {...scan, result: results[idx], timestampResultData: database.coin.meta.timestampMs};
    });
}

export function runScans(blueprints: Scan[], database: AssetDatabase): AssetIdCoin[][] {
    return blueprints.map(bp => runScan(bp, database[bp.asset].payload));
}

export function runScan(blueprint: Scan, coins: HistoryWithId<'coin'>[]): AssetIdCoin[] {
    const preCoins = filterCoinsByPreselection(blueprint, coins);
    const selectedCoins = filterCoinsByConditions(preCoins, blueprint.conditions);
    return selectedCoins.map((coin: HistoryWithId<'coin'>): AssetIdCoin => coin.id);
}

// -------- private

function filterCoinsByPreselection(blueprint: Scan, coins: HistoryWithId<'coin'>[]): HistoryWithId<'coin'>[] {
    const ids = coins.map(coin => coin.id);
    const filteredIds = filterByPreselection(ids, blueprint.preSelection, blueprint.asset);
    return coins.filter(coin => filteredIds.includes(coin.id));
}

function filterCoinsByConditions(coins: HistoryWithId<'coin'>[], conditions: ConditionBlueprint<'coin'>[]): HistoryWithId<'coin'>[] {
    return conditions.reduce((selectedCoins, condition) => {
        const func = buildCondition(condition);
        return selectedCoins.filter(coin => func(coin.history));
    }, coins);
}
