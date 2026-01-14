import {Bucket, History, Storage} from '../../../../../../../shared-library/src/datatypes/data';
import {AssetIdCoin} from '../../../../../../../shared-library/src/asset/assets/coin/interfaces';
import {ForEach} from '../../../../../../../shared-library/src/datatypes/for-each';
import {TimeSteps} from '../../../../../../../shared-library/src/datatypes/time';

export type PartialStorage = ForEach<AssetIdCoin, TimeSteps>;
export type SplittableCoinHistory = History<'coin'>;
export type SplittableCoinStorage = Storage<'coin', 'HISTORY'>;
export type SplittableCoinBucket = Bucket<'coin', 'HISTORY'>;