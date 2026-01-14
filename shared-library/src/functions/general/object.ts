import {CompressedObj} from '../../datatypes/compress';
import {createForEach} from './for-each';

export function areObjectsEqual(first: object, second: object): boolean {
    // does not work for methods. Also failed if order of attributes changes
    return JSON.stringify(first) === JSON.stringify(second);
}

export function getKeysAs<Type extends string>(obj: object): Type[] {
    return Object.keys(obj) as Type[];
}

export function rmvUndefinedKeys(obj: any): void {
    getKeysAs<string>(obj).forEach(key => {
        if (obj[key] === undefined) {
            delete obj[key];
        }
    });
}

type NestedMapKeysFunction = (obj: any) => CompressedObj<any>;

export function mapKeys<T extends string>(obj: any, mapFunc: (keys: T[]) => string[], nestedMapKeys: NestedMapKeysFunction = o => o): CompressedObj<any> {
    const keys = getKeysAs<T>(obj);
    const mapped = mapFunc(keys).filter(element => element !== undefined);
    return createForEach(mapped, (_, idx) => nestedMapKeys(obj[keys[idx]]));
}

export function deepCopy<T>(source: T): T {
    // TODO: Refactor this
    /*
    Old:
    return JSON.parse(JSON.stringify(obj));
    New:
    Code from https://medium.com/javascript-in-plain-english/deep-clone-an-object-and-preserve-its-type-with-typescript-d488c35e5574
     */
    return Array.isArray(source)
        ? source.map(item => deepCopy(item))
        : source instanceof Date
            ? new Date(source.getTime())
            : source && typeof source === 'object'
                ? Object.getOwnPropertyNames(source).reduce((o, prop) => {
                    Object.defineProperty(o, prop, Object.getOwnPropertyDescriptor(source, prop) as any);
                    o[prop] = deepCopy((source as any)[prop]);
                    return o;
                }, Object.create(Object.getPrototypeOf(source)))
                : source;
}
