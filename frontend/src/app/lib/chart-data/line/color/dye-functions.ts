import {ColorChart} from '@app/lib/chart-data/interfaces';
import {getKeysAs} from "@shared_library/functions/general/object";

type AllColorObj = {[color in ColorChart]: any}; // only to make sure we always cover all available colors #type check

export const chartColors: ColorChart[] = getChartColors();
export function dyeFunctions(usedColors: ColorChart[]): ColorChart[] {
    const freeColorStack = getFreeColors(usedColors);
    return usedColors.map(color => resolveUndefinedColor(color, freeColorStack));
}


// private

function getChartColors(): ColorChart[] {
    const all: AllColorObj = {
        '--color-chart-0': '',
        '--color-chart-1': '',
        '--color-chart-2': '',
        '--color-chart-3': '',
        '--color-chart-4': '',
        '--color-chart-5': '',
        '--color-chart-6': '',
        '--color-chart-7': '',
        '--color-chart-8': '',
        '--color-chart-9': ''
    };
    return getKeysAs(all);
}

function getFreeColors(usedColors: ColorChart[]): ColorChart[] {
    return chartColors.filter(color => !usedColors.includes(color));
}

function resolveUndefinedColor(color: ColorChart, freeColorStack: ColorChart[]): ColorChart {
    if (color === undefined) {
        if (freeColorStack.length > 0) {
            color = freeColorStack.shift();
        } else {
            throwError();
        }
    }
    return color;
}

function throwError() {
    const errMsg = 'In Dye-Function: Not enough free colors available';
    console.error(errMsg);
    throw new Error(errMsg);
}
