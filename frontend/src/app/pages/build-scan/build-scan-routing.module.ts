import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

import {BuildScanMenuComponent} from '@app/pages/build-scan/main-menu/build-scan-menu.component';
import {ConditionsComponent} from '@app/pages/build-scan/conditions-menu/conditions.component';
import {PreselectionComponent} from '@app/pages/build-scan/preselection-menu/preselection.component';
import {ConditionModifyComponent} from "@app/pages/build-scan/_components/condition-modify/condition-modify.component";

const routes: Routes = [
    {
        path: '',
        children: [
            {
                path: '',
                component: BuildScanMenuComponent
            },
            {
                path: 'conditions',
                component: ConditionsComponent
            },
            {
                path: 'conditions/modify/:idx',
                component: ConditionModifyComponent
            },
            {
                path: 'preselection',
                component: PreselectionComponent
            }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class BuildScanRoutingModule {
}

