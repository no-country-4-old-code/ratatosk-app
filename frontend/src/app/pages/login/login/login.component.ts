import {Component} from '@angular/core';
import {AuthService} from '@app/services/auth.service';
import {UserService} from '@app/services/user.service';
import {MatDialog} from '@angular/material/dialog';
import {MatSnackBar} from '@angular/material/snack-bar';
import {UserLastSelectionService} from '@app/services/user-last-selection.service';
import {Router} from '@angular/router';
import {HttpClient} from '@angular/common/http';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginComponent {
    constructor(public auth: AuthService, public user: UserService, public dialog: MatDialog,
                public snackBar: MatSnackBar, public tab: UserLastSelectionService, public router: Router,
                public http: HttpClient) {
        // script.loadScript('gcapture').then(result => console.log('Load script with ', result));
    }
}
