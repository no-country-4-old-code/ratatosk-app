import {ParamOption, Params} from './interfaces-params';
import {lookupScope2String} from './lookup-scope-string';
import {getKeysAs} from '../../../functions/general/object';

type LookupParam2String = { [param in ParamOption]: (param: number) => string };
type LookupParam2Beautiful = { [param in ParamOption]: (param: number) => string };

const lookupParam2String: LookupParam2String = {
    factor: (factor: number) => `${factor}`,
    scope: (scope: number) => (lookupScope2String as any)[scope],
    threshold: (threshold: number) => `${threshold}`,
    weight: (weight: number) => `${weight}`,
};

const lookupParam2Beautiful: LookupParam2Beautiful = {
    factor: (factor: number) => `${factor}`,
    scope: (scope: number) => `over the last ${(lookupScope2String as any)[scope]}`,
    threshold: (threshold: number) => `of ${threshold}`,
    weight: (weight: number) => `weighted with ${weight}`,
};

export function mapParams2String(params: Params, excludedOptions: ParamOption[] = []): string {
    const options = extractParamOptions(params, excludedOptions);
    const infos = options.map(option => lookupParam2String[option](params[option] as number));
    return infos.join(', ');
}

export function mapParams2BeautifulString(params: Params, excludedOptions: ParamOption[] = []): string {
    const options = extractParamOptions(params, excludedOptions);
    const infos = options.map(option => lookupParam2Beautiful[option](params[option] as number));
    return infos.join(' ');
}

export function mapFactor2Multiplier(params: Params) {
    let factor = '';
    if (params.factor !== 1) {
        factor = `${params.factor} * `;
    }
    return factor;
}

export function mapFactor2PercentOf(params: Params) {
    let percentOf = '';
    if (params.factor !== undefined && params.factor !== 1) {
        const inPercent = Math.round(params.factor * 1000) / 10;
        percentOf = `${inPercent} % of `;
    }
    return percentOf;
}

// private

function extractParamOptions(params: Params, excludedParams: ParamOption[] = []): ParamOption[] {
    const options = getKeysAs<ParamOption>(params);
    return options.filter(name => !excludedParams.includes(name));
}

