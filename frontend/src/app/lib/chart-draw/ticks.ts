import {TimeRangeFrontend} from '@app/lib/coin/interfaces';

export const lookupTicksByChartWidth: Record<number, number> = {
    0: 4,
    350: 6,
    550: 8,
    750: 10,
    850: 12,
};

export const lookupTicksByChartHeight: Record<number, number> = {
    0: 4,
    75: 6,
    125: 8,
    175: 10,
    225: 12,
    275: 16,
};


export const lookupTickFormatByRange: { [range in TimeRangeFrontend]: string } = {
    // See https://github.com/d3/d3-time-format#locale_format
    '1H': '%H:%M',
    '2H': '%H:%M',
    '4H': '%H:%M',
    '12H': '%H:%M',
    '1D': '%H:%M',
    '3D': '%H:%M',
    '1W': '%d %b',
    '1M': '%d %b',
    '3M': '%d %b',
    '6M': '%d %b',
    '1Y': '%d %b',
    '5Y': '%d %b %y',
};

export function getNumberOfTicks(lengthOfAxis: number, lookupTicks: Record<number, number>): number {
    // scales only generate ticks at 1-, 2-, and 5-multiples of powers of ten, so the actual number of ticks may be different
    let ticks = lookupTicks[0];
    const breakpoints = Object.keys(lookupTicks);
    breakpoints.forEach((breakpoint: string) => {
        if (lengthOfAxis >= Number(breakpoint)) {
            ticks = lookupTicks[breakpoint];
        }
    });
    return ticks;
}

export function getTickFormatForY(axisY: any): string {
    // http://bl.ocks.org/zanarmstrong/05c1e95bf7aa16c4768e
    let format = '';
    if (areTickLabelsToLong(axisY)) {
        format = '.3n';
    }
    return format;
}

function areTickLabelsToLong(axisY: any): boolean {
    const breakpointMax = 100000;
    const breakpointMin = 1;
    const minMax = axisY.domain();
    const maxValue = Math.max(...minMax.map(Math.abs));
    return maxValue > breakpointMax || maxValue < breakpointMin;
}
