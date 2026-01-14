import {ParamOption, Params} from './params/interfaces-params';
import {
    mapFactor2Multiplier,
    mapFactor2PercentOf,
    mapParams2BeautifulString,
    mapParams2String
} from './params/map-to-string';
import {getInfoOfFunction} from './info';
import {getParamOptions} from './params/utils';
import {FunctionOption} from './interfaces';
import {MetricHistory} from '../../datatypes/data';
import {lookupAssetFactory} from '../../asset/lookup-asset-factory';

// TODO:
// Metrics has to be shown nice in metric dialog
// Beuatify function is called to often in function dialog
// Height of dynamic bla

type LookupFunctionName2Beautiful = {[func in FunctionOption]: string}

export function mapFuncBlueprint2String(funcOption: FunctionOption, params: Params, overwriteFuncName?: string): string {
    const excludedOptions = getExcludedOptions(funcOption);
    const factorStr = mapFactor2Multiplier(params);
    const paramsStr = getParamsInBrackets(params, excludedOptions);
    const funcName = (overwriteFuncName) ? overwriteFuncName : funcOption;
    return `${factorStr}${funcName}${paramsStr}`;
}

export function mapFuncBlueprint2BeautifulString(funcOption: FunctionOption, params: Params, metric: MetricHistory<any>): string {
    const factorStr = mapFactor2PercentOf(params);
    const funcName = mapFuncOption2BeautifulString(funcOption, metric);
    const funcNameBold = `the <b>${funcName}</b>`;
    const paramsStr = mapParams2BeautifulString(params, ['factor']);
    return `${factorStr}${funcNameBold} ${paramsStr}`;
}

export function mapFuncOption2BeautifulString(funcOption: FunctionOption, metric: MetricHistory<any>): string {
    // TODO: Viel Spaß Zukunfts-Moritz beim aufdrosseln :D
    const asset = lookupAssetFactory['coin'];
    const lookup: LookupFunctionName2Beautiful = {
        'value': `current ${asset.lookupMetric2Name[metric as MetricHistory<'coin'>]}`,
        threshold: 'threshold',
        max: 'maximum',
        min: 'minimum',
        deviation: 'deviation',
        average: 'moving average',
        pastValue: 'past value'
    };
    return lookup[funcOption];
}

// private

function getParamsInBrackets(params: Params, excludedOptions: ParamOption[] = []): string {
    const infoString = mapParams2String(params, excludedOptions);
    if (infoString.length === 0) {
        return '';
    }
    return `(${infoString})`;
}

function getExcludedOptions(funcOption: FunctionOption): ParamOption[] {
    const supportedOptions = getInfoOfFunction(funcOption).supportedParams;
    const excludedOptions = getParamOptions().filter(option => !supportedOptions.includes(option));
    return [...excludedOptions, 'factor'];
}

