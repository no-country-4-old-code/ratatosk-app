import {Directive, Input} from '@angular/core';
import {Observable} from "rxjs";

type MappingFunction<T> = (option: T) => Observable<string>

export interface DisplayBlueprint<T> {
    mapOption2String$: MappingFunction<T>;
}

@Directive()
export abstract class AbstractDisplay<T> {
    @Input() mapOption2String$: MappingFunction<T>;
}
