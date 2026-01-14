import {Component, ComponentFactoryResolver, Input, OnInit, ViewChild} from '@angular/core';
import {DynamicLoadDirective} from '@app/shared/directive/dynamic-load.directive';
import {OnDestroyMixin} from '@app/lib/components/mixin-on-destroy';
import {getKeysAs} from '@shared_library/functions/general/object';


@Component({
    selector: 'app-dynamic-load',
    templateUrl: './dynamic-load.component.html',
    styleUrls: ['./dynamic-load.component.scss']
})
export class DynamicLoadComponent extends OnDestroyMixin implements OnInit {
    @ViewChild(DynamicLoadDirective, {static: true}) appDynamicLoad: DynamicLoadDirective;
    @Input() component: any;
    @Input() attributeData: object;


    constructor(private componentFactoryResolver: ComponentFactoryResolver) {
        super();
    }

    ngOnInit() {
        this.loadComponent(this.component);
    }

    // private

    private loadComponent(component: any): void {
        const componentFactory = this.componentFactoryResolver.resolveComponentFactory(component);
        const viewContainerRef = this.appDynamicLoad.viewContainerRef;
        viewContainerRef.clear();
        const componentRef = viewContainerRef.createComponent(componentFactory);
        const attributes = getKeysAs(this.attributeData);
        attributes.forEach(attr => {
            (componentRef.instance as any)[attr] = this.attributeData[attr];
        });
    }

}