import {AngularFirestore} from '@angular/fire/firestore';
import {AuthService} from '@app/services/auth.service';
import {UserService} from '@app/services/user.service';
import {HttpClient} from '@angular/common/http';
import {CoinService} from '@app/services/coin.service';
import {BuildService} from '@app/services/build.service';
import {MockControl} from '@test/helper-frontend/mocks/helper';
import {buildMockControlFirestore, MockControlFirestore} from '@test/helper-frontend/mocks/mock-firestore';
import {buildMockControlUserService, MockControlUser} from '@test/helper-frontend/mocks/mock-user';
import {buildMockControlCoin, MockControlCoin} from '@test/helper-frontend/mocks/mock-coin';
import {buildMockControlBuild, MockControlBuild} from '@test/helper-frontend/mocks/mock-build';
import {buildMockControlAuthService, MockControlAuth} from '@test/helper-frontend/mocks/mock-auth';
import {buildMockControlHttpClient, MockControlHttp} from '@test/helper-frontend/mocks/mock-http';
import {buildMockControlScan, MockControlScan} from '@test/helper-frontend/mocks/mock-scans';
import {ScanService} from '@app/services/scan.service';
import {UserRoleService} from '@app/services/user-role.service';
import {buildMockControlUserRole, MockControlRole} from '@test/helper-frontend/mocks/mock-role';
import {buildMockControlActiveRoute, MockControlRoute} from '@test/helper-frontend/mocks/mock-route';
import {ActivatedRoute, Router} from '@angular/router';
import {buildMockControlDialog, MockControlDialog} from '@test/helper-frontend/mocks/mock-dialog';
import {MatDialog} from '@angular/material/dialog';
import {buildMockControlLocation, MockControlLocation} from '@test/helper-frontend/mocks/mock-location';
import {Location} from '@angular/common';
import {buildMockControlRouter} from '@test/helper-frontend/mocks/mock-router';
import {AngularFireAuth} from '@angular/fire/auth';
import {buildMockControlFireAuth, MockControlFireAuth} from '@test/helper-frontend/mocks/mock-fire-auth';
import {MatSnackBar} from '@angular/material/snack-bar';
import {buildMockControlMatSnackBar} from '@test/helper-frontend/mocks/mock-snackbar';
import {RouteInfoService} from '@app/services/route-info.service';
import {buildMockControlRouteInfo} from '@test/helper-frontend/mocks/mock-route-info';
import {buildMockControlClipboard} from '@test/helper-frontend/mocks/mock-clipboard';
import {Clipboard} from '@angular/cdk/clipboard';
import {AreScansSynchronizedService} from '@app/services/are-scans-synchronized.service';
import {buildMockControlScansSynchronized} from '@test/helper-frontend/mocks/mock-are-scans-synchronzied';
import {UserLastSelectionService} from '@app/services/user-last-selection.service';
import {buildMockControlUserLastSelection} from '@test/helper-frontend/mocks/mock-user-last-selection';
import {BuildConditionService} from "@app/services/build-condition.service";
import {buildMockControlBuildConditions} from "@test/helper-frontend/mocks/mock-build-condition";

export interface MockControlArray {
	firestore: MockControl<AngularFirestore, MockControlFirestore>;
	fireauth: MockControl<AngularFireAuth, MockControlFireAuth>;
	auth: MockControl<AuthService, MockControlAuth>;
	user: MockControl<UserService, MockControlUser>;
	coin: MockControl<CoinService, MockControlCoin>;
	clipboard: MockControl<Clipboard, {}>;
	build: MockControl<BuildService, MockControlBuild>;
	buildConditions: MockControl<BuildConditionService, {}>;
	http: MockControl<HttpClient, MockControlHttp>;
	scan: MockControl<ScanService, MockControlScan>;
	role: MockControl<UserRoleService, MockControlRole>;
	route: MockControl<ActivatedRoute, MockControlRoute>;
	router: MockControl<Router, {}>;
	routeInfo: MockControl<RouteInfoService, {}>;
	dialog: MockControl<MatDialog, MockControlDialog>;
	location: MockControl<Location, MockControlLocation>;
	snackbar: MockControl<MatSnackBar, {}>;
	areScanSync: MockControl<AreScansSynchronizedService, {}>;
	userLastSelection: MockControl<UserLastSelectionService, {}>;
}

export function buildAllMocks(): MockControlArray {
	return {
		auth: buildMockControlAuthService(),
		build: buildMockControlBuild(),
		buildConditions: buildMockControlBuildConditions(),
		coin: buildMockControlCoin(),
		clipboard: buildMockControlClipboard(),
		dialog: buildMockControlDialog(),
		firestore: buildMockControlFirestore(),
		fireauth: buildMockControlFireAuth(),
		http: buildMockControlHttpClient(),
		location: buildMockControlLocation(),
		role: buildMockControlUserRole(),
		route: buildMockControlActiveRoute(),
		router: buildMockControlRouter(),
		routeInfo: buildMockControlRouteInfo(),
		snackbar: buildMockControlMatSnackBar(),
		user: buildMockControlUserService(),
		scan: buildMockControlScan(),
		areScanSync: buildMockControlScansSynchronized(),
		userLastSelection: buildMockControlUserLastSelection()
	};
}
