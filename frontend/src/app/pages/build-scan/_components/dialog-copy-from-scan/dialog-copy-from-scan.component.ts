import {ChangeDetectionStrategy, Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import {ScanService} from '@app/services/scan.service';
import {ScanFrontend} from '@app/lib/scan/interfaces';

export interface DialogCopyData {
    extractInfo: (view: ScanFrontend) => string;
}


@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-dialog-basic',
    templateUrl: './dialog-copy-from-scan.component.html',
    styleUrls: ['./dialog-copy-from-scan.component.scss']
})
export class DialogCopyFromScanComponent {

    constructor(@Inject(MAT_DIALOG_DATA) public data: DialogCopyData, public scanService: ScanService) {
    }

}
