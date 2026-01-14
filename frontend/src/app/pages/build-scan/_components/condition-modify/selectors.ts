import {combineLatest, Observable, of} from 'rxjs';
import {SelectorBlueprint} from '@lib/components/abstract-selector';
import {getCompareOptions} from '@shared_library/scan/condition/lookup-compare';
import {distinctUntilChanged, filter, map, shareReplay} from 'rxjs/operators';
import {FunctionBlueprint, FunctionOption} from '@shared_library/scan/indicator-functions/interfaces';
import {lookupMetricInfo} from '@lib/coin/lookup-metric-info';
import {lookupCompareInfo} from '@lib/indicator-functions/lookupCompareInfo';
import {lookupFunctionInfo} from '@lib/indicator-functions/lookupFunctionInfo';
import {UserRoleService} from '@app/services/user-role.service';
import {getPermittedOptions$} from '@lib/user-role/options/get-options';
import {
    allOptionsFunction,
    allOptionsMetric,
    freeOptionsFunction,
    freeOptionsMetric
} from '@lib/user-role/options/options';
import {MetricCoinHistory} from '@shared_library/asset/assets/coin/interfaces';
import {CompareOption, ConditionBlueprint} from '@shared_library/scan/condition/interfaces';
import {mapFuncBlueprint2BeautifulString} from "@shared_library/scan/indicator-functions/map-to-string";
import {assetCoin} from "@shared_library/asset/lookup-asset-factory";

export type UpdateConditionFunction = (modifier: (condition: ConditionBlueprint<'coin'>) => ConditionBlueprint<'coin'>) => void;
export type UpdateConditionFunctionFunction = (modifier: (func: FunctionBlueprint) => FunctionBlueprint) => void;

export interface SelectorExtended<T> extends SelectorBlueprint<T> {
    optionsInfo$: Observable<string[]>;
    title: string;
}

export function createSelectorCompare(condition$: Observable<ConditionBlueprint<'coin'>>, update: UpdateConditionFunction): SelectorExtended<CompareOption> {
    return {
        title: 'compare method',
        selected$: getSelected$(condition$, (condition: ConditionBlueprint<'coin'>) => condition.compare),
        options$: of(getCompareOptions()),
        optionsInfo$: of(getCompareOptions().map(opt => lookupCompareInfo[opt])),
        mapOption2String$: (option: CompareOption) => of(option),
        onSelectionCallback: getCallbackCompare(update)
    };
}

export function createSelectorMetric(condition$: Observable<ConditionBlueprint<'coin'>>, update: UpdateConditionFunction, role: UserRoleService): SelectorExtended<MetricCoinHistory> {
    const options$ = getAvailableMetricOptions(role);
    return {
        title: 'metric',
        selected$: getSelected$(condition$, (condition: ConditionBlueprint<'coin'>) => condition.metric),
        options$,
        optionsInfo$: options$.pipe(map(options => options.map(opt => lookupMetricInfo[opt]))),
        mapOption2String$: (option: MetricCoinHistory) => of(assetCoin.lookupMetric2Name[option]),
        onSelectionCallback: getCallbackAttribute(update)
    };
}

export function createSelectorFunction(blueprint$: Observable<FunctionBlueprint>, condition$: Observable<ConditionBlueprint<'coin'>>, update: UpdateConditionFunctionFunction, role: UserRoleService): SelectorExtended<FunctionOption> {
    const options$ = getAvailableFunctionOptions(role);
    const metric$ = condition$.pipe(
        map(cond => cond.metric)
    );
    return {
        title: 'function',
        selected$: getSelected$(blueprint$, (blueprint: FunctionBlueprint) => blueprint.func),
        options$,
        optionsInfo$: options$.pipe(map(options => options.map(opt => lookupFunctionInfo[opt]))),
        mapOption2String$: (option: FunctionOption) => {
            return combineLatest(blueprint$, metric$).pipe(
                map(([funcBlueprint, metric]) => mapFuncBlueprint2BeautifulString(option, funcBlueprint.params, metric))
            )
        },
        onSelectionCallback: getCallbackFunction(update) as any
    };
}

// private

function getSelected$<A, B>(stream$: Observable<A>, accessor: (a: A) => B): Observable<B[]> {
    return stream$.pipe(
        filter(content => content !== undefined),
        map(accessor),
        distinctUntilChanged(),
        map(element => [element]));
}

function getAvailableFunctionOptions(role: UserRoleService): Observable<FunctionOption[]> {
    return getPermittedOptions$(role, freeOptionsFunction, allOptionsFunction).pipe(shareReplay(1));
}

function getAvailableMetricOptions(role: UserRoleService): Observable<MetricCoinHistory[]> {
    return getPermittedOptions$(role, freeOptionsMetric, allOptionsMetric).pipe(shareReplay(1));

}

function getCallbackCompare(update: (modifier: (condition: ConditionBlueprint<'coin'>) => ConditionBlueprint<'coin'>) => void) {
    return (selection: CompareOption[]) => {
        const modifier = (condition: ConditionBlueprint<'coin'>) => {
            condition.compare = selection[0];
            return condition;
        };
        update(modifier);
    };
}

function getCallbackAttribute(update: (modifier: (condition: ConditionBlueprint<'coin'>) => ConditionBlueprint<'coin'>) => void) {
    return (selection: MetricCoinHistory[]) => {
        const modifier = (condition: ConditionBlueprint<'coin'>) => {
            condition.metric = selection[0];
            return condition;
        };
        update(modifier);
    };
}

function getCallbackFunction(update: (modifier: (func: FunctionBlueprint) => FunctionBlueprint) => void) {
    return (selection: FunctionBlueprint[]) => {
        const modifier = (blueprint: FunctionBlueprint) => {
            return {...selection[0]};
        };
        update(modifier);
    };
}
