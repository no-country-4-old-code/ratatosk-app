import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';
import {Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';
import {AssetIdCoin} from '../../../../../../../shared-library/src/asset/assets/coin/interfaces';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-view-card',
    templateUrl: './scan-statuc-card.component.html',
    styleUrls: ['./scan-statuc-card.component.scss']
})
export class ScanStatucCardComponent implements OnInit {
    @Input() title = '';
    @Input() content$: Observable<AssetIdCoin[]>;
    @Input() numberMaximalCoins: number;
    @Input() iconPath = '';
    subtext$: Observable<string>;

    ngOnInit(): void {
        this.subtext$ = this.content$.pipe(
            map(content => content.length.toString()),
            startWith('?'),
            map(numberOfCoins => `${numberOfCoins} / ${this.numberMaximalCoins.toString()}`)
        );
    }
}
