import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ScansRoutingModule} from './scans-routing.module';
import {AllScansComponent} from './scans/all-scans.component';
import {AngularMaterialImportModule} from '@app/third-party/angular-material-import/angular-material-import.module';
import {SharedModule} from '@app/shared/shared.module';
import {ScanStatucCardComponent} from './_components/view-card/scan-statuc-card.component';
import {ScanContentComponent} from './scan-content/scan-content.component';
import {ScanContentElementComponent} from './_components/scan-content-list-element/scan-content-element.component';
import {ListHeaderComponent} from './_components/list-header/list-header.component';
import {ScrollingModule} from '@angular/cdk/scrolling';
import {AssetDetailsComponent} from './asset-detail/asset-details.component';
import {CoinDetailsSheetComponent} from './_components/coin-details-sheet/coin-details-sheet.component';
import {
    CoinDetailsHeaderInfoComponent
} from './_components/coin-details-header-info/coin-details-header-info.component';
import {AssetChartComponent} from './_components/asset-chart/asset-chart.component';
import {AssetAboutComponent} from './_components/asset-about/asset-about.component';

@NgModule({
    declarations: [
        AllScansComponent, ScanStatucCardComponent, ScanContentComponent, ScanContentElementComponent, ListHeaderComponent, AssetDetailsComponent,
        CoinDetailsSheetComponent, CoinDetailsHeaderInfoComponent, AssetChartComponent, AssetAboutComponent],
    imports: [
        CommonModule,
        ScansRoutingModule,
        AngularMaterialImportModule,
        SharedModule,
        ScrollingModule,
    ],
    exports: [
        AllScansComponent
    ]
})
export class ScansModule {
}

