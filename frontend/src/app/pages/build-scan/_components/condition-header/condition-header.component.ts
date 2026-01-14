import {ChangeDetectionStrategy, Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {filter, map, tap} from 'rxjs/operators';
import {
    mapFuncBlueprint2BeautifulString
} from '../../../../../../../shared-library/src/scan/indicator-functions/map-to-string';
import {MetricCoinHistory} from '../../../../../../../shared-library/src/asset/assets/coin/interfaces';
import {ChartBoolSample, ColorChart} from '@app/lib/chart-data/interfaces';
import {Observable, ReplaySubject} from 'rxjs';
import {ConditionBlueprint} from '../../../../../../../shared-library/src/scan/condition/interfaces';
import {mapCompare2Beautiful} from "@shared_library/scan/condition/map-to-string";
import {MetricHistory} from "@shared_library/datatypes/data";
import {AssetType} from "@shared_library/asset/interfaces-asset";
import {createForEach} from "@shared_library/functions/general/for-each";
import {chartColors} from "@lib/chart-data/line/color/dye-functions";
import {assetCoin} from "@shared_library/asset/lookup-asset-factory";


interface InfoCondition {
    left: string;
    right: string;
    compare: string;
    metric: MetricCoinHistory;
    color: ColorChart;
}

type LookupMetric2Color<T extends AssetType> = {[metric in MetricHistory<T>]: ColorChart}

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-condition-header',
    templateUrl: './condition-header.component.html',
    styleUrls: ['./condition-header.component.scss']
})
export class ConditionHeaderComponent implements OnChanges {
    @Input() condition: ConditionBlueprint<'coin'>;
    @Input() chartSamples: ChartBoolSample[];
    @Input() isSelected = false;
    readonly info$: Observable<InfoCondition>;
    private readonly subjectInfo = new ReplaySubject<ConditionBlueprint<'coin'>>(1);
    private readonly lookupMetric2Color = this.createLookupMetric2Color(assetCoin.getMetricsHistory());

    constructor() {
        this.info$ = this.getInfo$();
    }

    ngOnChanges(changes: SimpleChanges): void {
        this.subjectInfo.next(this.condition);
    }

    // private

    private getInfo$(): Observable<InfoCondition> {
        return this.subjectInfo.asObservable().pipe(
            tap(x => console.log('Before filter ', x)),
            filter(condition => condition !== undefined),
            tap(x => console.log('After filter ', x, x !== undefined)),
            map((cond) => this.mapCondition2Info(cond)));
    }

    private mapCondition2Info(condition: ConditionBlueprint<'coin'>): InfoCondition {
        return {
            left: mapFuncBlueprint2BeautifulString(condition.left.func, condition.left.params, condition.metric),
            right: mapFuncBlueprint2BeautifulString(condition.right.func, condition.right.params, condition.metric),
            compare: mapCompare2Beautiful(condition.compare),
            metric: condition.metric,
            color: this.lookupMetric2Color[condition.metric]
        };
    }

    private createLookupMetric2Color<T extends AssetType>(metrics: MetricHistory<T>[]): LookupMetric2Color<T> {
        const offset = 2; // do not start with same colar as two charts
        return createForEach(metrics, (metric, idx) => {
            const colorIdx = (idx + offset) % chartColors.length;
            return chartColors[colorIdx]
        });
    }
}
