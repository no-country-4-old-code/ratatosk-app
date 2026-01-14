import {FunctionFactory, FunctionInfo, IndicatorFunction} from '../interfaces';
import {Params} from '../params/interfaces-params';
import {checkParams} from '../params/param-check';

type BuildFunction<FUNCTION> = (params: Required<Params>) => FUNCTION;

export function assembleFunctionFactory(buildFunction: BuildFunction<IndicatorFunction>, getInfo: () => FunctionInfo): FunctionFactory {
    const info = getInfo();
    return {
        build: (params: Params): IndicatorFunction => {
            const checkedParams = checkParams(params, info);
            return buildFunction(checkedParams);
        },
        getInfo
    };
}
