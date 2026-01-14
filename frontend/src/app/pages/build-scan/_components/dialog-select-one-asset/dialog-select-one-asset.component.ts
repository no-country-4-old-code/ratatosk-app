import {ChangeDetectionStrategy, Component} from '@angular/core';
import {UserRoleService} from '@app/services/user-role.service';
import {filterCoinIdsByTerm} from '@app/lib/filter/filter-coins';
import {distinctUntilChanged, map, shareReplay, startWith} from 'rxjs/operators';
import {getPermittedOptions$} from '@app/lib/user-role/options/get-options';
import {lookupCoinInfo} from '../../../../../../../shared-library/src/asset/assets/coin/helper/lookup-coin-info-basic';
import {allOptionsCoinIds, freeOptionsCoinIds} from '@app/lib/user-role/options/options';
import {combineLatest, Observable, Subject} from 'rxjs';
import {areArraysEqual} from '../../../../../../../shared-library/src/functions/general/array';
import {AssetIdCoin} from '../../../../../../../shared-library/src/asset/assets/coin/interfaces';


@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-dialog-select-one-coin',
    templateUrl: './dialog-select-one-asset.component.html',
    styleUrls: ['./dialog-select-one-asset.component.scss']
})
export class DialogSelectOneAssetComponent {
    readonly coinIds$: Observable<AssetIdCoin[]>;
    readonly lookup = lookupCoinInfo;
    private readonly subjectFilter = new Subject<string>();

    constructor(private roleService: UserRoleService) {
        const ids$ = getPermittedOptions$(roleService, freeOptionsCoinIds, allOptionsCoinIds);
        this.coinIds$ = this.getCoinIdsShown$(ids$);
    }

    onSearchTermUpdate(term: string): void {
        this.subjectFilter.next(term);
    }

    private getCoinIdsShown$(ids$: Observable<AssetIdCoin[]>): Observable<AssetIdCoin[]> {
        const filter$ = this.subjectFilter.asObservable().pipe(startWith(''));
        return combineLatest(ids$, filter$).pipe(
            map(([ids, filerTerm]) => filterCoinIdsByTerm(ids, filerTerm)),
            distinctUntilChanged((oldA, newA) => areArraysEqual(oldA, newA)),
            shareReplay(1),
        );
    }
}
