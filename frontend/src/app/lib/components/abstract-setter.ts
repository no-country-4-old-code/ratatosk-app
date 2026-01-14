import {Directive, EventEmitter, Input, Output} from '@angular/core';
import {Observable} from 'rxjs';
import {AbstractDisplay, DisplayBlueprint} from '@app/lib/components/abstract-display';

export type ChangeCallback<T> = (newSettings: T) => void;

export interface SetterBlueprint<T> extends DisplayBlueprint<T> {
    settings$: Observable<T>;
    onChangeCallback: ChangeCallback<T>;
}

@Directive()
export abstract class AbstractSetter<T> extends AbstractDisplay<T> {
    /*
    Display multiple settings (given as key-value pair with settings name as key and settings value as value). .
    User can modify values of given settings.
    Event is triggered on every change of any setting value.
 */
    @Input() settings$: Observable<T>;
    @Output() onChange = new EventEmitter<T>();
}
