import {Meta, MetaData} from '../../datatypes/meta';
import {Bucket, BucketContent, LookupTypeBucketContent} from '../../datatypes/data';
import {AssetType} from '../../asset/interfaces-asset';


export function addMeta<CONTENT>(content: CONTENT, meta: MetaData): Meta<CONTENT> {
    return {meta: meta, payload: content};
}

export function createBucket<T extends AssetType, C extends BucketContent>(meta: MetaData, payload: LookupTypeBucketContent<T, C>): Bucket<T, C> {
    return {meta, payload};
}

