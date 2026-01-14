import {NgModule} from '@angular/core';
import {CommonModule, registerLocaleData} from '@angular/common';
import {AppBarNormalComponent} from './components/app-bar/app-bar-normal/app-bar-normal.component';
import {AngularMaterialImportModule} from '@app/third-party/angular-material-import/angular-material-import.module';
import {BasicBarComponent} from '@shared_comp/app-bar/basic-bar/basic-bar.component';
import {CurrencyCoinShortedPipe} from './pipes/currency-coin-shorted.pipe';
import localeFr from '@angular/common/locales/fr';
import {CurrencyCoinPipe} from './pipes/currency-coin.pipe';
import {AppBarSearchComponent} from './components/app-bar/app-bar-search/app-bar-search.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {SelectorHorizontalComponent} from './components/selector-horizontal/selector-horizontal.component';
import {AutoFocusDirective} from './directive/auto-focus.directive';
import {ReversePipe} from './pipes/reverse.pipe';
import {ChartLineComponent} from '@shared_comp/chart-line/chart-line.component';
import {
    SelectorChipHorizontalComponent
} from './components/selector-chip-horizontal/selector-chip-horizontal.component';
import {ColoredPercentComponent} from '@shared_comp/colored-percent/colored-percent.component';
import {AppBarReturnComponent} from '@shared_comp/app-bar/app-bar-return/app-bar-return.component';
import {FabButtonComponent} from './components/fab-button/fab-button.component';
import {LoadingComponent} from './components/loading/loading.component';
import {MatBadgeExtensionDirective} from '@app/shared/directive/mat-badge-extension.directive';
import {DialogConfirmationComponent} from '@app/shared/components/dialog-confirm/dialog-confirmation.component';
import {SearchComponent} from './components/search/search.component';
import {SlideComponent} from './components/slide/slide.component';
import {DialogSelectOneComponent} from './components/dialog-select-one/dialog-select-one.component';
import {ChartBooleanComponent} from './components/chart-boolean/chart-boolean.component';
import {
    ListElementIconAndTextComponent
} from '@shared_comp/list-element/list-element-icon-and-text/list-element-icon-and-text.component';
import {MakeFirstLetterBigPipe} from '@app/shared/pipes/make-first-letter-big.pipe';
import {DynamicLoadDirective} from '@app/shared/directive/dynamic-load.directive';
import {DialogLoadingComponent} from './components/dialog-loading/dialog-loading.component';
import {HammerModule} from '@angular/platform-browser';
import {ListElementBasicComponent} from '@shared_comp/list-element/list-element-basic/list-element-basic.component';
import {ListElementIconComponent} from '@shared_comp/list-element/list-element-icon/list-element-icon.component';
import {ListElementTextComponent} from '@shared_comp/list-element/list-element--text/list-element-text.component';
import {ChartSparklineComponent} from './components/chart-sparkline/chart-sparkline.component';
import {FabButtonSecondaryComponent} from './components/fab-button-secondary/fab-button-secondary.component';
import {CenteredBadgeComponent} from '@shared_comp/centered-badge/centered-badge.component';
import {RouterModule} from '@angular/router';
import {DialogInfoComponent} from './components/dialog-info/dialog-info.component';


registerLocaleData(localeFr);

@NgModule({
	declarations: [AppBarNormalComponent, BasicBarComponent, CurrencyCoinShortedPipe, CurrencyCoinPipe,
		AppBarSearchComponent, SelectorHorizontalComponent, AutoFocusDirective, ReversePipe, ChartLineComponent,
		SelectorChipHorizontalComponent, ColoredPercentComponent, AppBarReturnComponent, FabButtonComponent, LoadingComponent,
		MatBadgeExtensionDirective, DialogConfirmationComponent, SearchComponent,
		SlideComponent, DialogSelectOneComponent, ChartBooleanComponent, ListElementIconAndTextComponent, MakeFirstLetterBigPipe,
		DynamicLoadDirective, ListElementBasicComponent, ListElementIconComponent, ListElementTextComponent,
		DialogLoadingComponent,
		ChartSparklineComponent,
		FabButtonSecondaryComponent, CenteredBadgeComponent, DialogInfoComponent],
	imports: [
		CommonModule,
		AngularMaterialImportModule,
		FormsModule,
		ReactiveFormsModule,
		HammerModule,
		RouterModule
	],
	exports: [AppBarNormalComponent, AppBarSearchComponent, AppBarReturnComponent, CurrencyCoinShortedPipe,
		CurrencyCoinPipe, SelectorHorizontalComponent, AutoFocusDirective, ReversePipe, ChartLineComponent,
		SelectorChipHorizontalComponent, ColoredPercentComponent, FabButtonComponent, LoadingComponent,
		MatBadgeExtensionDirective, DialogConfirmationComponent, DialogSelectOneComponent,
		SearchComponent, SlideComponent, ChartBooleanComponent,
		ListElementIconAndTextComponent, ListElementBasicComponent, ListElementIconComponent, ListElementTextComponent,
		MakeFirstLetterBigPipe, DynamicLoadDirective, ChartSparklineComponent, FabButtonSecondaryComponent, CenteredBadgeComponent
	],

})
export class SharedModule {
}
