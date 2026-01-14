import {Directive, ViewContainerRef} from '@angular/core';

@Directive({
	selector: '[appDynamicLoad]',
})
export class DynamicLoadDirective {
	constructor(public viewContainerRef: ViewContainerRef) {
	}
}
