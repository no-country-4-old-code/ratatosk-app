import {Component} from '@angular/core';
import {materialIcons} from '@lib/global/icons';
import {appInfo} from '@lib/global/app-info';
import {Location} from '@angular/common';

@Component({
  selector: 'app-disclaimer',
  templateUrl: './disclaimer.component.html',
  styleUrls: ['./disclaimer.component.scss']
})
export class DisclaimerComponent {
  readonly title = 'disclaimer';
  readonly iconBack = materialIcons.back;
  readonly email = appInfo.emailContact;
  readonly appName = appInfo.name;
  readonly appUrl = appInfo.url;

  constructor(public location: Location) {
  }
}
