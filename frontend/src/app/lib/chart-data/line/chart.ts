import {MetricCoinHistory} from '../../../../../../shared-library/src/asset/assets/coin/interfaces';
import {ChartData, ColoredFunction} from '@app/lib/chart-data/interfaces';
import {buildChartData} from '@app/lib/chart-data/line/chart-data/chart-data';
import {dyeFunctions} from '@app/lib/chart-data/line/color/dye-functions';
import {combineLatest, Observable} from 'rxjs';
import {convertChartDataToTimeRangeFrontend} from '@app/lib/chart-data/line/chart-data/range-frontend';
import {lookupFrontendRange2TimeRange} from '@app/lib/coin/range-frontend/lookup-frontend-range';
import {applyFunctionsToSimulation} from '@app/lib/chart-data/line/simulation/run/run-all';
import {map} from 'rxjs/operators';
import {TimeRangeFrontend} from '@app/lib/coin/interfaces';
import {Meta} from '../../../../../../shared-library/src/datatypes/meta';
import {History} from '../../../../../../shared-library/src/datatypes/data';
import {ConditionBlueprint} from '../../../../../../shared-library/src/scan/condition/interfaces';


export function getChart$(historyWithMetaData$: Observable<Meta<History<'coin'>>>, timeRange$: Observable<TimeRangeFrontend>,
                          attribute$: Observable<MetricCoinHistory>, functions$: Observable<ColoredFunction[]>): Observable<ChartData> {
    return combineLatest(historyWithMetaData$, timeRange$, attribute$, functions$).pipe(
        map(([historyWithMetaData, timeRange, attribute, funcBlueprints]) => {
            return createChartData(historyWithMetaData, attribute, timeRange, funcBlueprints);
        }));
}

export function getChartArray$(conditions$: Observable<readonly ConditionBlueprint<'coin'>[]>, history$: Observable<Meta<History<'coin'>>>,
                               range$: Observable<TimeRangeFrontend>): Observable<ChartData[]> {
    return combineLatest(history$, range$, conditions$).pipe(
        map(([history, range, conditions]) => {
            return conditions.map(condition => {
                const options = mapCondition2ColoredFunctions(condition);
                return createChartData(history, condition.metric, range, options);
            });
        }));
}

export function createChartData(history: Meta<History<'coin'>>, attribute: MetricCoinHistory, rangeFronted: TimeRangeFrontend,
                                funcSelected: ColoredFunction[]): ChartData {
    const range = lookupFrontendRange2TimeRange[rangeFronted];
    const colors = dyeFunctions(funcSelected.map(f => f.color));
    const samples = applyFunctionsToSimulation(history.payload, attribute, range, funcSelected.map(x => x.blueprint));
    const chartData = buildChartData(samples, range, history.meta, colors);
    return convertChartDataToTimeRangeFrontend(chartData, range, rangeFronted);
}

// private

function mapCondition2ColoredFunctions(condition: ConditionBlueprint<'coin'>): ColoredFunction[] {
    return [{color: '--color-chart-0', blueprint: condition.left}, {
        color: '--color-chart-1',
        blueprint: condition.right
    }];
}
