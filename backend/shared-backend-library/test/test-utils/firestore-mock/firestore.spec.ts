import {FirestoreMock} from '../../../src/test-utils/firestore-mock/firestore';
import {useFirestoreMock} from '../../../src/test-utils/firestore-mock/use-firestore-mock';

describe('Test firestore mock', function () {
    let mock: FirestoreMock;

    beforeEach(function () {
        mock = useFirestoreMock();
    });

    describe('Test write', function () {

        it('should start with empty db', function () {
            expect(mock.db).toEqual({});
        });

        it('should write to db', async function () {
            const testObj = {test: 1123};
            const doc = mock.collection('buu').doc('ya');
            await doc.set(testObj);
            expect(mock.db['buu']['ya']).toEqual(testObj);
        });
    });


    describe('Test create', function () {

        it('should write to db if document is not exisiting', async function () {
            const testObj = {test: 1123};
            await mock.collection('buu').doc('ya').create(testObj);
            expect(mock.db['buu']['ya']).toEqual(testObj);
        });

        it('should throw error if document already exits', async function () {
            const testObj = {test: 1123};
            let hadThrownError = false;
            await mock.collection('buu').doc('ya').create(testObj);
            try {
                await mock.collection('buu').doc('ya').create(testObj);
            } catch (e) {
                hadThrownError = true;
            }
            expect(hadThrownError).toBeTruthy();
        });
    });

    describe('Test read', function () {

        it('should read from db', async function () {
            const testObj = {'tada': 234};
            mock.db = {'example': {'uff': testObj}};
            const doc = mock.collection('example').doc('uff');
            const value = await doc.get();
            expect(value.data()).toEqual(testObj);
        });

        it('should read after write', async function () {
            const doc = mock.collection('example').doc('uff');
            await doc.set({content: 123});
            const value = await doc.get();
            expect(value.data()).toEqual({content: 123});
        });
    });

    describe('Test exists', function () {

        it('should set "exists" to true if document exists and data is callable', async function () {
            const doc = mock.collection('example').doc('uff');
            await doc.set({content: 123});
            const value = await doc.get();
            expect(value.exists).toBeTruthy();
        });

        it('should set "exists" to false if document does not exists and data is not callable', async function () {
            const doc = mock.collection('example').doc('uff');
            const value = await doc.get();
            expect(value.exists).toBeFalsy();
        });
    });

    describe('Test update', function () {

        it('should update empty object', async function () {
            const doc = mock.collection('example').doc('id');
            await doc.set({});
            await doc.update({content: 42});
            expect(mock.db['example']['id']).toEqual({content: 42});
        });

        it('should overwrite existing attribute', async function () {
            const doc = mock.collection('example').doc('id');
            await doc.set({content: 24});
            await doc.update({content: 25});
            expect(mock.db['example']['id']).toEqual({content: 25});
        });

        it('should not overwrite other attributes', async function () {
            const doc = mock.collection('example').doc('id');
            await doc.set({other: 'huhu', content: 24, stuff: 123});
            await doc.update({content: 25});
            expect(mock.db['example']['id']).toEqual({other: 'huhu', content: 25, stuff: 123});
        });
    });

    describe('Test where', function () {

        beforeEach(function () {
            mock.db = {
                'example': {
                    'alice': {a: 0, b: 1, c: 2},
                    'bob': {a: -1, b: 0, c: 1},
                    'charlie': {a: -2, b: -1, c: 0},
                }
            };
        });

        async function act(query: any, expectedIds: string[]): Promise<void> {
            const docs = await query.get();
            const ids = docs.docs.map((doc: any): string => doc.id);
            expect(ids).toEqual(expectedIds);
        }

        it('should show all if every id is selected', async function () {
            const query = mock.collection('example')
                .where('a', '>', -3);
            await act(query, ['alice', 'bob', 'charlie']);
        });

        it('should show only matched id (single where)', async function () {
            const query = mock.collection('example')
                .where('a', '>', -2);
            await act(query, ['alice', 'bob']);
        });

        it('should allow combining of multiple wheres if attributes stays the same (firestore req.)', async function () {
            const query = mock.collection('example')
                .where('c', '>', 0)
                .where('c', '<', 2);
            await act(query, ['bob']);
        });

        it('should not allow combining of multiple wheres with different attributes (firestore req.)', async function () {
            const runQuery = () => {
                const query = mock.collection('example')
                    .where('c', '>', 0)
                    .where('a', '<', 0);
                return act(query, ['bob']);
            };
            expect(runQuery).toThrowError();
        });
    });
});
