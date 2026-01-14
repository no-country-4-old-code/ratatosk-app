import {NgModule} from '@angular/core';
import {PreloadAllModules, RouterModule, Routes} from '@angular/router';

const routes: Routes = [
	{
		path: '',
		redirectTo: 'menu',
		pathMatch: 'full'
	},
	{
		path: 'menu',
		loadChildren: () => import('./pages/main-menu/main-menu.module').then(m => m.MainMenuModule),
	},
	{
		path: 'welcome-android',
		loadChildren: () => import('./pages/android/android.module').then(m => m.AndroidModule),
	},
	{
		path: 'landing-page',
		loadChildren: () => import('./pages/landing-page/landing-page.module').then(m => m.LandingPageModule),
	},
	{
		path: '**',
		pathMatch: 'full',
		loadChildren: () => import('./pages/error404/error404.module').then(m => m.Error404Module)
	}
];

@NgModule({
	imports: [RouterModule.forRoot(routes,
		{ relativeLinkResolution: 'legacy', preloadingStrategy: PreloadAllModules })
	],
	exports: [RouterModule]
})
export class AppRoutingModule {
}
