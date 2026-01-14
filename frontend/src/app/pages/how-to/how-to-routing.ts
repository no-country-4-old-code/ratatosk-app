import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {HowToMenuComponent} from '@app/pages/how-to/menu/how-to-menu.component';
import {GetStartedScanComponent} from '@app/pages/how-to/get-started-scan/get-started-scan.component';
import {DocumentationComponent} from '@app/pages/how-to/documentation/documentation.component';
import {FaqComponent} from '@app/pages/how-to/faq/faq.component';


const routes: Routes = [
    {
        path: '',
        children: [
            {
                path: '',
                component: HowToMenuComponent
            },
            {
                path: 'get-started/scans',
                component: GetStartedScanComponent
            },
            {
                path: 'doc/' + ':doc',
                component: DocumentationComponent
            },
            {
                path: 'faq',
                component: FaqComponent
            }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class HowToRouting {
}
