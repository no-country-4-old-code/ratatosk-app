import {PubSubMock} from './pub-sub';
import {pubSubApi} from '../../../../src/helper/pub-sub/lib/api';

export function usePubSubMock(): PubSubMock {
    const mock = new PubSubMock();
    spyOn(pubSubApi, 'getPubSub').and.returnValue(mock);
    return mock;
}
