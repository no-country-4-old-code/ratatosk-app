import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {HowToRouting} from './how-to-routing';
import {HowToMenuComponent} from './menu/how-to-menu.component';
import {SharedModule} from '@app/shared/shared.module';
import {GetStartedScanComponent} from './get-started-scan/get-started-scan.component';
import {DocumentationComponent} from 'app/pages/how-to/documentation/documentation.component';
import {FaqComponent} from './faq/faq.component';
import {AngularMaterialImportModule} from '@app/third-party/angular-material-import/angular-material-import.module';
import {
    DocumentationSectionTextComponent
} from './_components/documentation-section-text/documentation-section-text.component';
import {
    DocumentationSectionPanelComponent
} from './_components/documentation-section-panel/documentation-section-panel.component';
import {DocumentationMultipleComponent} from './_components/documentation-section/documentation-multiple.component';
import {DynamicLoadComponent} from './_components/dynamic-load/dynamic-load.component';
import {DocumentationDividerComponent} from './_components/documentation-divider/documentation-divider.component';


@NgModule({
    declarations: [HowToMenuComponent, GetStartedScanComponent, DocumentationComponent, FaqComponent, DocumentationSectionTextComponent, DocumentationSectionPanelComponent, DocumentationMultipleComponent, DynamicLoadComponent, DocumentationDividerComponent],
    imports: [
        CommonModule,
        HowToRouting,
        SharedModule,
        AngularMaterialImportModule
    ]
})
export class HowTo {
}
