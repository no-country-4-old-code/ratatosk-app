import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {appInfo} from '@lib/global/app-info';
import {imagePaths} from '@lib/global/images';

interface DialogInfoData {
  text: string;
};

@Component({
  selector: 'app-dialog-info',
  templateUrl: './dialog-info.component.html',
  styleUrls: ['./dialog-info.component.scss']
})
export class DialogInfoComponent {
  readonly linkTwitter = appInfo.twitterAccountUrl;
  readonly iconRatatosk = imagePaths.appSmall;

  constructor(public dialogRef: MatDialogRef<DialogInfoComponent>,
              @Inject(MAT_DIALOG_DATA) public data: DialogInfoData) {

  }

}