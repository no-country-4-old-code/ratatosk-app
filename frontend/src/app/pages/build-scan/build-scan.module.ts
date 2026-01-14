import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {BuildScanRoutingModule} from './build-scan-routing.module';
import {BuildScanMenuComponent} from '@app/pages/build-scan/main-menu/build-scan-menu.component';
import {SharedModule} from '@app/shared/shared.module';
import {AngularMaterialImportModule} from '@app/third-party/angular-material-import/angular-material-import.module';
import {
    DialogCopyFromScanComponent
} from '@app/pages/build-scan/_components/dialog-copy-from-scan/dialog-copy-from-scan.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {InfoCardComponent} from './_components/card-info/info-card.component';
import {DialogIconComponent} from 'app/pages/build-scan/_components/dialog-icon/dialog-icon.component';
import {DialogPreselectionComponent} from './_components/dialog-preselection/dialog-preselection.component';
import {ScrollingModule} from '@angular/cdk/scrolling';
import {ConditionsComponent} from './conditions-menu/conditions.component';
import {ConditionHeaderComponent} from 'app/pages/build-scan/_components/condition-header/condition-header.component';
import {
    SelectorConditionOptionComponent
} from '@app/pages/build-scan/_components/selector-condition-option/selector-condition-option.component';
import {SelectorSlideComponent} from './_components/selector-slide/selector-slide.component';
import {DialogSelectOneAssetComponent} from './_components/dialog-select-one-asset/dialog-select-one-asset.component';
import {CategoryCardComponent} from '@app/pages/build-scan/_components/card-category/category-card.component';
import {SelectorNumberComponent} from './_components/selector-number/selector-number.component';
import {PreselectionComponent} from './preselection-menu/preselection.component';
import {DialogModifyFunctionComponent} from './_components/dialog-modify-function/dialog-modify-function.component';
import {
    SelectorModifyFunctionComponent
} from './_components/selector-modify-function/selector-modify-function.component';
import {ConditionChartsComponent} from './_components/condition-charts/condition-charts.component';
import {ConditionModifyComponent} from './_components/condition-modify/condition-modify.component';


@NgModule({
    declarations: [BuildScanMenuComponent, DialogCopyFromScanComponent, InfoCardComponent, DialogIconComponent,
        DialogPreselectionComponent, ConditionsComponent, ConditionHeaderComponent,
        SelectorConditionOptionComponent, SelectorSlideComponent,
        DialogSelectOneAssetComponent, CategoryCardComponent, SelectorNumberComponent, PreselectionComponent, DialogModifyFunctionComponent
        , SelectorModifyFunctionComponent, ConditionChartsComponent, ConditionModifyComponent],

    imports: [
        CommonModule,
        BuildScanRoutingModule,
        SharedModule,
        AngularMaterialImportModule,
        FormsModule,
        ReactiveFormsModule,
        ScrollingModule
    ]
})
export class BuildScanModule {
}
