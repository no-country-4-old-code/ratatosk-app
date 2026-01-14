import {TimeRange} from '../../../../../../../shared-library/src/datatypes/time';
import {
    rmvStartOfArrayToTimeRangeFrontendLength,
    wasExtendedRangeGiven
} from '@app/lib/coin/range-frontend/range-frontend';
import {ChartData} from '@app/lib/chart-data/interfaces';
import {TimeRangeFrontend} from '@app/lib/coin/interfaces';

export function convertChartDataToTimeRangeFrontend(chartData: ChartData, range: TimeRange, timeRangeFrontend: TimeRangeFrontend): ChartData {
    return {
        colors: chartData.colors,
        unit: chartData.unit,
        data: convertToTimeRangeFrontend(chartData.data, range, timeRangeFrontend)
    };
}


// private


function convertToTimeRangeFrontend<T>(array: T[], range: TimeRange, rangeFrontend: TimeRangeFrontend): T[] {
    if (wasExtendedRangeGiven(range, rangeFrontend)) {
        array = rmvStartOfArrayToTimeRangeFrontendLength<T>(array, rangeFrontend);
    }
    return array;
}
