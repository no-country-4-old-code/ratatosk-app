import {ResponseGeckoApi} from '../interfaces';
import {retry} from 'ts-retry-promise';

export function sleep(ms: number): Promise<number> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function mapToDefaultIfBadResponse<T>(resp: ResponseGeckoApi<T>, defaultValue: T): T {
    let data: T;
    if (resp.success) {
        data = resp.data as T;
    } else {
        const errDetail = JSON.stringify(resp.data);
        const errMsg = `Code: ${resp.code}; Message: ${resp.message}; Data: ${errDetail}`;
        console.error(`ERROR in gecko response. ${errMsg}`);
        data = defaultValue;
    }
    return data;
}

export function withRetries<T>(createNewPromise: () => Promise<T>, numberOfTries: number, defaultValue: T, name: string): Promise<T> {
    // ! createNewPromise should really create a new promise to make this retry work (not reuse an old one!)
    const config = {
        retries: numberOfTries - 1,
        logger: () => console.warn(`Retry for ${name}`),
        delay: 1000 // in ms
    };
    return retry(createNewPromise, config).catch(err => {
        console.error(`Error after ${numberOfTries} tries for ${name} with err code: ${err}. Return default`);
        return defaultValue;
    });
}