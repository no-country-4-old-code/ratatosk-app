import {ScopeInMin} from './interfaces-params';
import {MinMax} from './min-max';

export function getFactorMinMax(): MinMax {
    const max = 10;
    return {min: 0, max};
}

export function getThresholdMinMax(): MinMax {
    const max = 1000000000;
    return {min: -max, max};
}

export function getScopes(): ScopeInMin[] {
    // scopeObj is bind to typescript which verify that it contains all ScopeInMin options
    const scopeObj: { [scope in ScopeInMin]: any } = {
        60: null,
        120: null,
        180: null,
        240: null,
        300: null,
        360: null,
        720: null,
        1440: null,
        2880: null,
        4320: null,
        5760: null,
        7200: null,
        8640: null,
        10080: null,
        20160: null,
        30240: null,
        40320: null,
        80640: null,
        120960: null,
        302400: null,
        423360: null,
        524160: null,
        1048320: null
    };
    return Object.keys(scopeObj).map(key => Number(key) as ScopeInMin);
}

export function getWeights(): number[] {
    return [-5, -4, -3.5, -3, -2.5, -2, -1.5, -1, -0.5, 0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 5];
}

