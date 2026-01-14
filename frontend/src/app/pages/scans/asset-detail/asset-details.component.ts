import {BehaviorSubject, Observable} from 'rxjs';
import {map, shareReplay, switchMap} from 'rxjs/operators';
import {CoinService} from '@app/services/coin.service';
import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {Coin} from '@app/lib/coin/interfaces';
import {ActivatedRoute} from '@angular/router';
import {Location} from '@angular/common';
import {materialIcons} from '@app/lib/global/icons';
import {AssetIdCoin} from '../../../../../../shared-library/src/asset/assets/coin/interfaces';
import {UserLastSelectionService} from '@app/services/user-last-selection.service';
import {getSwipedIndex} from '@lib/multiple-used/get-swiped-index';
import {AssetId} from '@shared_library/datatypes/data';


@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-asset-details',
    templateUrl: './asset-details.component.html',
    styleUrls: ['./asset-details.component.scss']
})
export class AssetDetailsComponent implements OnInit {
    id$: Observable<AssetId<any>>;
    asset$: Observable<Coin>;
    readonly tabIndexSubject = new BehaviorSubject<number>(0);
    readonly icons = materialIcons;
    private readonly maxNumberOfTabs = 2;

    constructor(private coins: CoinService, private route: ActivatedRoute,
                private location: Location, public tab: UserLastSelectionService) {
    }

    ngOnInit(): void {
        this.id$ = this.getAssetId$();
        this.asset$ = this.getAsset$();
    }

    onClickAtAppBar(element: string) {
        switch (element) {
            case this.icons.back: {
                this.location.back();
                break;
            }
        }
    }

    swipeTabs(event): void {
        const index = this.tabIndexSubject.getValue();
        const newIndex = getSwipedIndex(event, index, this.maxNumberOfTabs - 1);
        this.tabIndexSubject.next(newIndex);
    }

    // private

    private getAsset$(): Observable<Coin> {
        return this.getAssetId$().pipe(
            switchMap(id => this.coins.getCoinByID(id)),
            shareReplay(1));
    }

    private getAssetId$(): Observable<AssetIdCoin> {
        return this.route.paramMap.pipe(
            map(params => params.get('id')));
    }
}
