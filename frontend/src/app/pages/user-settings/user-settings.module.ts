import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {UserSettingsRoutingModule} from './user-settings-routing.module';
import {UserSettingsComponent} from './user-settings/user-settings.component';
import {SharedModule} from '@app/shared/shared.module';
import {AngularMaterialImportModule} from '@app/third-party/angular-material-import/angular-material-import.module';


@NgModule({
	declarations: [UserSettingsComponent],
	imports: [
		CommonModule,
		UserSettingsRoutingModule,
		SharedModule,
		AngularMaterialImportModule
	]
})
export class UserSettingsModule {
}
