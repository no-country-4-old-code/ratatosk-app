import {ChangeDetectionStrategy, Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import {DialogCopyData} from '@app/pages/build-scan/_components/dialog-copy-from-scan/dialog-copy-from-scan.component';
import {getScanIconIds, lookupScanIcon} from '@app/lib/scan/lookup-icons';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-dialog-select-view',
    templateUrl: './dialog-icon.component.html',
    styleUrls: ['./dialog-icon.component.scss']
})
export class DialogIconComponent {
    readonly iconIds = getScanIconIds();
    readonly lookup = lookupScanIcon;

    constructor(@Inject(MAT_DIALOG_DATA) public data: DialogCopyData) {
    }
}
