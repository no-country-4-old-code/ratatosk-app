import {ForEach} from '../../datatypes/for-each';
import {FillFunction} from '../../datatypes/utils';

export function createForEach<KEY extends string, CONTENT>(keys: KEY[], fillContent: FillFunction<KEY, CONTENT>): ForEach<KEY, CONTENT> {
    const obj: any = {};
    keys.forEach((key, idx) => {
        obj[key] = fillContent(key, idx);
    });
    return obj;
}