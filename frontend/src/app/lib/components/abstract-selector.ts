import {Directive, EventEmitter, Input, Output} from '@angular/core';
import {Observable} from 'rxjs';
import {AbstractDisplay, DisplayBlueprint} from '@app/lib/components/abstract-display';

export type SelectionCallback<T> = (option: T[]) => void;

export interface SelectorBlueprint<T> extends DisplayBlueprint<T> {
    options$: Observable<T[]>;
    selected$: Observable<T[]>;
    onSelectionCallback: SelectionCallback<T>;
}


// TODO: Selectors should "implement" instead of "extend" AbstractSelector because it holds no functions.

@Directive()
export abstract class AbstractSelector<T> extends AbstractDisplay<T> {
    /*
    Display multiple options.
    User can select none, one or multiple.
    Event is triggered on every selection.
     */
    @Input() options$: Observable<T[]>;
    @Input() selected$: Observable<T[]>;
    @Output() onSelection = new EventEmitter<T[]>();
}
