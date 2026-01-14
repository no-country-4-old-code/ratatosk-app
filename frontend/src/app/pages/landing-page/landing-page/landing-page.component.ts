import {Component} from '@angular/core';
import {imagePaths} from "@lib/global/images";
import {materialIcons} from "@lib/global/icons";
import {Router} from "@angular/router";
import {appInfo} from "@lib/global/app-info";

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.scss']
})
export class LandingPageComponent {
  readonly iconApp = imagePaths.appSmall;
  readonly iconsMaterial = materialIcons;
  readonly internalLinks = appInfo.internalLinks;
  readonly externalLinkToTwitter = appInfo.twitterAccountUrl;

  constructor(private router: Router) {
  }

  navigateTo(url: string) {
    this.router.navigate([url]);
  }
}
