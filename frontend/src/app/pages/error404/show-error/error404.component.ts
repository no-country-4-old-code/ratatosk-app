import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-error404',
    templateUrl: './error404.component.html',
    styleUrls: ['./error404.component.scss']
})
export class Error404Component implements OnInit {
    readonly pageTitle = 'error';

    constructor() {
    }

    ngOnInit() {
        console.log('hello');
    }

}
