import {FunctionBlueprint} from '../../../../../shared-library/src/scan/indicator-functions/interfaces';
import {Currency} from '../../../../../shared-library/src/datatypes/currency';

export type ColorChart = '--color-chart-0' |
    '--color-chart-1' | '--color-chart-2' | '--color-chart-3' |
    '--color-chart-4' | '--color-chart-5' | '--color-chart-6' |
    '--color-chart-7' | '--color-chart-8' | '--color-chart-9';

export type ColorChartSparkline = ColorChart | '--color-chart-increase' | '--color-chart-decrease'

export interface ChartData {
    unit: Currency;
    colors: ColorChart[];
    data: ChartLineSample[];
}

export interface ChartLineSample {
    x: Date;
    yCharts: number[];
}

export interface ChartBoolSample {
    x: Date;
    y: boolean;
}

export type ChartSparkSample = number;

export interface ColoredFunction {
    blueprint: FunctionBlueprint;
    color: ColorChart;
}
