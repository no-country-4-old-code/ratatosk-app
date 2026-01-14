import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {ProVersionComponent} from '@app/pages/pro-version/pro-version/pro-version.component';


const routes: Routes = [
    {
        path: '',
        children: [
            {
                path: '',
                component: ProVersionComponent
            }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ProVersionRoutingModule {
}
