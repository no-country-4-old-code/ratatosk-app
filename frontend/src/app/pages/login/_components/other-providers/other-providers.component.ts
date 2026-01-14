import {Component} from '@angular/core';
import {AuthProvidersComponent} from 'ngx-auth-firebaseui';

@Component({
    selector: 'app-other-providers',
    templateUrl: './other-providers.component.html',
    styleUrls: ['./other-providers.component.scss']
}) // dummy to use ngx-providers but adapt html (origin html from github -> then modified)
export class OtherProvidersComponent extends AuthProvidersComponent {
}

// todo: add url to call etc.
