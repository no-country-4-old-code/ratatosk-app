import {Injectable} from '@angular/core';
import {combineLatest, Observable} from 'rxjs';
import {distinctUntilChanged, map, shareReplay} from 'rxjs/operators';
import {
    PermissionCheckInput,
    PermissionCheckResult,
    RestrictedAction,
    UserRole
} from '@app/lib/user-role/permission-check/interfaces';
import {lookupPermission} from '@app/lib/user-role/permission-check/lookupPermissionCheck';
import {AuthInfo, AuthService} from '@app/services/auth.service';
import {UserService} from '@app/services/user.service';
import {ScanService} from '@app/services/scan.service';
import {BuildService} from '@app/services/build.service';
import {mapToClone} from '@app/lib/rxjs/map-to-clone';
import {isProVersionValid} from '@app/lib/user-role/pro-version/is-pro';
import {UserData} from '../../../../shared-library/src/datatypes/user';


// TODO: Demo -> In Backend -> User ID verification catch the exception
// TODO: Adapt user data to format "useProVersionUntil" etc --> see UserData (firebase rule currently angry)
// TODO: Fix bug in chnage detection of result-of-one under cnstruction (e.g. add new scan -> cancel -> Dialog pops up "do you really bla")
// TODO: Better Demo msg..  Error is very disturbing

@Injectable({
	providedIn: 'root'
})
export class UserRoleService {
	readonly role$: Observable<UserRole>;
	private readonly input$: Observable<PermissionCheckInput>;

	constructor(private view: ScanService, private auth: AuthService, private user: UserService, private buildView: BuildService) {
		this.role$ = this.getRole$(auth, user);
		this.input$ = this.getInput$();
	}

	getPermissionCheck$(action: RestrictedAction): Observable<PermissionCheckResult> {
		return combineLatest(this.role$, this.input$).pipe(
			map(([role, input]) => lookupPermission[action][role](input)),
			distinctUntilChanged((x, y) => x.isPermitted === y.isPermitted),
			shareReplay(1));
	}

	// private

	private getInput$(): Observable<PermissionCheckInput> {
		return combineLatest(this.view.scans$, this.buildView.currentBlueprint$).pipe(
			map(([views, viewUnderConstruct]) => ({numberOfScanBlueprints: views.length, numberOfConditionsOfScan: viewUnderConstruct.conditions.length})),
			shareReplay(1),
			mapToClone());
	}
	// numberOfConditionsOfView , numberOfViews

	private getRole$(auth: AuthService, user: UserService) {
		return combineLatest(user.user$, auth.authUserInfo$).pipe(
			map(([userData, authInfo]) => this.mapToRole(authInfo, userData)),
			distinctUntilChanged(),
			shareReplay(1),
			mapToClone()
		);
	}

	private mapToRole(auth: AuthInfo, user: UserData): UserRole {
		let role: UserRole = auth.isDemo ? 'demo' : 'user';
		if (role !== 'demo' && isProVersionValid(user)) {
			role = 'pro';
		}
		return role;
	}
}
