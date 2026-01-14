import {HotStreamArray} from '@app/lib/util/hot-stream-array';
import {Observable, of} from 'rxjs';
import {AssetIdCoin} from '../../../../../shared-library/src/asset/assets/coin/interfaces';

describe('Test cache stream array', function () {
    const maxSize = 3;
    let dut: HotStreamArray<any>;
    let callCountCreate: number;


    function createStream(id: AssetIdCoin): Observable<any> {
        callCountCreate++;
        return of(id);
    }

    function getNumberOfElements() {
        return dut['streams'].length;
    }

    beforeEach(function () {
        callCountCreate = 0;
        dut = new HotStreamArray(createStream, maxSize);
    });

    it('should not create any element at init', () => {
        dut = new HotStreamArray(createStream, maxSize);
        expect(callCountCreate).toEqual(0);
        expect(getNumberOfElements()).toEqual(0);
    });

    it('should create element if requested and not in array', () => {
        const stream$ = dut.getStreamById('id0');
        stream$.subscribe(res => expect(res).toEqual('id0'));
        expect(callCountCreate).toEqual(1);
        expect(getNumberOfElements()).toEqual(1);
    });

    it('should not create element if it is already in array', () => {
        dut.getStreamById('id0');
        dut.getStreamById('id1');
        const stream$ = dut.getStreamById('id1');
        stream$.subscribe(res => expect(res).toEqual('id1'));
        expect(callCountCreate).toEqual(2);
        expect(getNumberOfElements()).toEqual(2);
    });

    it('should delete last if array exceeds maximum', () => {
        dut.getStreamById('id0');
        dut.getStreamById('id1');
        dut.getStreamById('id2');
        dut.getStreamById('id42');
        expect(callCountCreate).toEqual(4);
        expect(getNumberOfElements()).toEqual(3);
    });

});
