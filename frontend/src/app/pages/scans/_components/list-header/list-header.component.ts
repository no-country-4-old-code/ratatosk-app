import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output} from '@angular/core';
import {Observable} from 'rxjs';
import {MetricCoinSnapshot} from '../../../../../../../shared-library/src/asset/assets/coin/interfaces';
import {SortRequest} from '@app/lib/coin/sort';


@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-list-header',
    templateUrl: './list-header.component.html',
    styleUrls: ['./app-list-header.component.scss']
})
export class ListHeaderComponent {
    @Input() leftLabel: MetricCoinSnapshot;
    @Input() middleLabel: MetricCoinSnapshot;
    @Input() rightLabel: MetricCoinSnapshot;
    @Input() sortInfo$: Observable<SortRequest>;
    @Output() clickOnLabel = new EventEmitter<SortRequest>();
    readonly lookupAscendingIcon = {true: 'keyboard_arrow_up', false: 'keyboard_arrow_down'};

    onClick(attr: MetricCoinSnapshot, old: SortRequest) {
        const sortRequest: SortRequest = {metric: attr, ascending: this.isSortedAscending(attr, old)};
        this.clickOnLabel.emit(sortRequest);
    }

    isSelected(label: MetricCoinSnapshot, sortInfo: SortRequest): boolean {
        return label === sortInfo.metric;
    }

    private isSortedAscending(attr: MetricCoinSnapshot, old: SortRequest): boolean {
        let isAscending = true;
        if (attr === old.metric) {
            isAscending = !old.ascending;
        }
        return isAscending;
    }
}
