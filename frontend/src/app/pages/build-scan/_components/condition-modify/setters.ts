import {Observable, of} from 'rxjs';
import {FunctionBlueprint} from '@shared_library/scan/indicator-functions/interfaces';
import {ChangeCallback, SetterBlueprint} from '@lib/components/abstract-setter';
import {Params} from '@shared_library/scan/indicator-functions/params/interfaces-params';
import {distinctUntilChanged, filter, map, shareReplay} from 'rxjs/operators';
import {mapParams2String} from '@shared_library/scan/indicator-functions/params/map-to-string';
import {UpdateConditionFunctionFunction} from '@app/pages/build-scan/_components/condition-modify/selectors';
import {areObjectsEqual} from '@shared_library/functions/general/object';


export function createSetterParams(func$: Observable<FunctionBlueprint>, update: UpdateConditionFunctionFunction): SetterBlueprint<Params> {
    return {
        settings$: getParams$(func$),
        onChangeCallback: buildCallback(update),
        mapOption2String$: (params: Params) => of(mapParams2String(params, []))
    };
}

// private

function getParams$(func$: Observable<FunctionBlueprint>): Observable<Params> {
    return func$.pipe(
        filter(blueprint => blueprint !== undefined),
        map(blueprint => blueprint.params),
        distinctUntilChanged((oldParams, newParams) => areObjectsEqual(oldParams, newParams)),
        shareReplay(1));
}

function buildCallback(update: UpdateConditionFunctionFunction): ChangeCallback<Params> {
    return (newParams: Params) => {
        const modifier = (blueprint: FunctionBlueprint) => {
            blueprint.params = newParams;
            return blueprint;
        };
        update(modifier);
    };
}
