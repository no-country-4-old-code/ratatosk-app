import {handleError, throwErrorIfInvalid} from '@app/lib/util/error';
import {fakeAsync, tick} from '@angular/core/testing';
import {Observable} from 'rxjs';

describe('Functions Error', () => {

    describe('handleError', () => {
        it('should return an observable', fakeAsync(() => {
            const array = ['miau', 'uff'];
            const ret: Observable<string[]> = handleError<string[]>('', array)('nothing');
            ret.subscribe({next: x => expect(x).toEqual(array)});
            tick(1000);
        }));

    });

    describe('throwErrorIfInvalid', () => {

        function expectErrorException(param) {
            expect(() => {
                throwErrorIfInvalid(param);
            }).toThrowError();
        }

        function expectNoErrorException(param) {
            expect(() => {
                throwErrorIfInvalid(param);
            }).not.toThrowError();
        }

        it('should throw no error when obj is somehow filled', () => {
            expectNoErrorException({value: 12});
        });

        it('should throw no error when obj is empty', () => {
            expectNoErrorException({});
        });

        it('should throw error when obj is undefined', () => {
            expectErrorException(undefined);
        });

        it('should throw error when obj is null', () => {
            expectErrorException(null);
        });

        it('should throw error when obj is ""', () => {
            expectErrorException('');
        });

        it('should throw error when obj is false', () => {
            expectErrorException(false);
        });

    });
});
