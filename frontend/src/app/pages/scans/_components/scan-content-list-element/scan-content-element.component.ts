import {ChangeDetectionStrategy, Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {lookupCurrencySymbol} from '@app/lib/coin/currency/unit';
import {AssetInScan} from '@lib/scan/interfaces';
import {materialIcons} from '@lib/global/icons';
import {ChartSparkSample, ColorChartSparkline} from '@lib/chart-data/interfaces';
import {Observable, ReplaySubject} from 'rxjs';
import {distinctUntilChanged, map} from 'rxjs/operators';
import {areObjectsEqual} from '@shared_library/functions/general/object';

interface AssetData {
    name: string,
    iconPath: string,
    isNewInScan: boolean,
    currencySymbol: string,
    price: number,
    delta: number,
    rank: number,
}

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-scan-content-list-element',
    templateUrl: './scan-content-element.component.html',
    styleUrls: ['./scan-content-element.component.scss']
})
export class ScanContentElementComponent implements OnChanges {
    @Input() asset: AssetInScan;
    readonly assetData$: Observable<AssetData>;
    readonly sparklineSamples$: Observable<ChartSparkSample[]>;
    readonly sparklineColor$: Observable<ColorChartSparkline>;
    readonly icons = materialIcons;
    readonly borderTextMiddle = 99;
    readonly borderTextLong = 999;
    private readonly subjectAsset = new ReplaySubject<AssetInScan>(1);

    constructor() {
        const asset$ = this.subjectAsset.asObservable().pipe(
            distinctUntilChanged((oldObj, newObj) => areObjectsEqual(oldObj, newObj))
        );
        this.assetData$ = this.getAssetData$(asset$);
        this.sparklineSamples$ = this.getSparklineSamples$(asset$);
        this.sparklineColor$ = this.getSparklineColor$(asset$);
    }

    ngOnChanges(changes: SimpleChanges) {
        this.subjectAsset.next(this.asset);
    }

    // private

    private getSparklineColor$(shared: Observable<AssetInScan>) {
        return shared.pipe(
            map(asset => asset.snapshot.delta),
            map(delta => {
                if (delta >= 0) {
                    return '--color-chart-increase'
                } else {
                    return '--color-chart-decrease'
                }
            })
        );
    }

    private getSparklineSamples$(shared: Observable<AssetInScan>) {
        return shared.pipe(
            map(asset => [...asset.snapshot.sparkline]),
            map(sparkline => sparkline.reverse()),
        );
    }

    private getAssetData$(asset$: Observable<AssetInScan>): Observable<AssetData> {
        return asset$.pipe(
            map((asset: AssetInScan): AssetData => {
                return {
                    name: asset.info.name,
                    iconPath: asset.info.iconPath,
                    currencySymbol: lookupCurrencySymbol[asset.info.unit],
                    isNewInScan: asset.relationToScan === 'new',
                    price: asset.snapshot.price,
                    delta: asset.snapshot.delta,
                    rank: asset.snapshot.rank,
                };
            })
        );
    }
}
