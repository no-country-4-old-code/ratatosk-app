import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AssetDetailsComponent} from '@pages_scans/asset-detail/asset-details.component';
import {AllScansComponent} from '@pages_scans/scans/all-scans.component';
import {ScanContentComponent} from '@pages_scans/scan-content/scan-content.component';

const pathResult = 'result/';
const pathDetail = 'detail/';
const pathBuild = 'build/';

const routes: Routes = [
    {
        path: '',
        children: [
            {
                path: '',
                component: AllScansComponent,
                //  canActivate: [AuthGuard]
            },
            {
                path: pathResult + ':id',
                component: ScanContentComponent,
                //  canActivate: [AuthGuard]
            },
            {
                path: pathDetail + ':id',
                redirectTo: pathDetail + ':id/0',
                pathMatch: 'full'
                //  canActivate: [AuthGuard]
            },
            {
                path: pathDetail + ':id/:scanId',
                component: AssetDetailsComponent,
                //  canActivate: [AuthGuard]
            },
            {
                path: pathBuild + ':id',
                loadChildren: () => import('../build-scan/build-scan.module').then(m => m.BuildScanModule)
            },
            // {path: '', redirectTo: 'pathOverviewView/0', pathMatch: 'full'},
            // { path: '**', component: Page404leavesComponent }
        ]
    },

];


@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ScansRoutingModule {
}

