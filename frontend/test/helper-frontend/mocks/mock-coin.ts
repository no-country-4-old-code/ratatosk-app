import {Observable, of} from 'rxjs';
import {Coin} from '@app/lib/coin/interfaces';
import {fromControl, MockControl} from '@test/helper-frontend/mocks/helper';
import {CoinService} from '@app/services/coin.service';
import {Meta} from '../../../../shared-library/src/datatypes/meta';
import {AssetIdCoin} from '../../../../shared-library/src/asset/assets/coin/interfaces';
import {History} from '../../../../shared-library/src/datatypes/data';

export interface MockControlCoin {
	coins$: Observable<Coin[]>;
	history$: Observable<Meta<History<'coin'>>>;
}

export function buildMockControlCoin(): MockControl<CoinService, MockControlCoin> {
	const control = {coins$: of(null), history$: of(null)};
	const mock = {
		coins$: fromControl(() => control.coins$),
		getCoinHistoryWithMetaData: (id: AssetIdCoin) => fromControl(() => control.history$)
	} as CoinService;
	return {mock, control};
}
