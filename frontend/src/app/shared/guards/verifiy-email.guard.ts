import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, CanActivateChild, Router, RouterStateSnapshot} from '@angular/router';
import {Observable} from 'rxjs';
import {AuthService} from '@app/services/auth.service';
import {map, take, tap} from 'rxjs/operators';


@Injectable({
	providedIn: 'root'
})
export class IsEmailVerifiedGuard implements CanActivate, CanActivateChild {
	// TODO: add test to check if this url is valid !
	private urlLogin = '/menu/options/login';

	constructor(private auth: AuthService, private router: Router) {}

	canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
		const isDisplayedPageVerificationPage = state.url === this.urlLogin;
		return this.auth.authUserInfo$.pipe(
			take(1),
			map(auth => auth.emailVerified || auth.isDemo || isDisplayedPageVerificationPage),
			tap(isValid => {
				if (!isValid) {
					this.router.navigate([this.urlLogin]);
				}})
		);
	}

	canActivateChild(childRoute: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
		return this.canActivate(childRoute, state);
	}

}
