import {NgModule} from '@angular/core';
import {MatChipsModule} from '@angular/material/chips';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatDialogModule} from '@angular/material/dialog';
import {MatBadgeModule} from '@angular/material/badge';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {MatSliderModule} from '@angular/material/slider';
import {MatSelectModule} from '@angular/material/select';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {MatIconModule} from '@angular/material/icon';
import {MatListModule} from '@angular/material/list';
import {MatInputModule} from '@angular/material/input';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatStepperModule} from '@angular/material/stepper';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatRadioModule} from '@angular/material/radio';
import {MatRippleModule} from '@angular/material/core';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatCardModule} from '@angular/material/card';
import {MatTabsModule} from '@angular/material/tabs';
import {MatButtonModule} from '@angular/material/button';

/*
The order of import matters for Angular Material (e.g. BrowserAnimationsModule has to come first).
To prevent any problems I put it in an extra module to determine the import order once and for all times ;).
 */


@NgModule({
	exports: [
		MatButtonToggleModule,
		MatButtonModule,
		MatListModule,
		MatRadioModule,
		MatInputModule,
		MatSidenavModule,
		MatStepperModule,
		MatToolbarModule,
		MatIconModule,
		MatTabsModule,
		MatCardModule,
		MatProgressSpinnerModule,
		MatCheckboxModule,
		MatRippleModule,
		MatChipsModule,
		MatAutocompleteModule,
		MatDialogModule,
		MatBadgeModule,
		MatSlideToggleModule,
		MatSliderModule,
		MatSnackBarModule,
		MatSelectModule,
		MatExpansionModule,
	]
})
export class AngularMaterialImportModule {
}
