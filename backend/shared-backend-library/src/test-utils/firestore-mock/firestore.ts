import {getKeysAs} from '../../../../../shared-library/src/functions/general/object';
import {firestore} from 'firebase-admin/lib/firestore';
import GrpcStatus = firestore.GrpcStatus;

interface Document {
    create: (content: any) => Promise<void>;
    set: (content: any) => Promise<void>;
    get: () => Promise<DocumentSnapshot>;
    update: (content: any) => Promise<void>;
    delete: () => Promise<void>;
    collection: (title: string) => Collection;
    path: () => string[];
    title: () => string;
}

interface Collection {
    doc: (title: string) => Document;
    where: (docElementPath: string, compare: string, constValue: string | number) => Query;
}

interface DocumentSnapshot {
    id: string;
    data: () => any | undefined;
    exists: boolean;
}

interface Query {
    get: () => Promise<QuerySnapshot>;
    where: (docElementPath: string, compare: string, constValue: string | number) => Query;
}

interface QuerySnapshot {
    docs: DocumentSnapshot[];
}


interface Batch {
    set: (doc: Document, content: any) => void;
    commit: () => Promise<void>;
}

export class FirestoreMock {
    db: any = {};
    currentBatch: Promise<void>[] = [];

    private static runCompare(first: any, compareOption: string, second: any): boolean {
        const lookup: any = {
            '<': (a: any, b: any) => a < b,
            '>': (a: any, b: any) => a > b,
            '<=': (a: any, b: any) => a <= b,
            '>=': (a: any, b: any) => a >= b,
            '!=': (a: any, b: any) => a !== b,
            '==': (a: any, b: any) => a === b,
            '=': (a: any, b: any) => a === b,
        };
        if (lookup[compareOption] === undefined) {
            throw new Error(`Compare option ${compareOption} is currently not supported by firestore mock`);
        }
        return lookup[compareOption](first, second);
    }

    collection(title: string): Collection {
        return this.createCollection(title, []);
    }

    // private

    batch(): Batch {
        return this.createBatch();
    }

    private createDoc(title: string, paths: string[], isAlreadyExisting: boolean): Document {
        return {
            create: (content: any) => {
                if (isAlreadyExisting) {
                    throw {code: GrpcStatus.ALREADY_EXISTS};
                }
                return this.setDb(content, title, paths);
            },
            set: (content: any) => this.setDb(content, title, paths),
            update: (content: any) => this.updateDb(content, title, paths),
            get: () => this.readDb(title, paths),
            delete: () => this.rmvDb(title, paths),
            collection: (t: string) => this.createCollection(t, [...paths, title]),
            path: () => paths,
            title: () => title
        };
    }

    private createCollection(title: string, paths: string[]): Collection {
        return {
            doc: (t: string) => {
                const isDocAlreadyExisting = this.isAlreadyExisting([...paths, title, t]);
                return this.createDoc(t, [...paths, title], isDocAlreadyExisting);
            },
            where: (docElementPath: string, compare: string, constValue: string | number) => {
                const pathNew = [...paths, title];
                const documents = this.getNamesOfElementsInPaths(pathNew);
                const filteredDocuments = this.getDocumentTitleFilteredByWhere(docElementPath, compare, constValue, pathNew, documents);
                return this.createQuery(pathNew, filteredDocuments, docElementPath);
            }
        };
    }

    private createQuery(paths: string[], filteredDocuments: string[], selectedElementField: string): Query {
        return {
            get: () => {
                const promises = filteredDocuments.map(name => this.readDb(name, paths));
                return Promise.all(promises).then(docs => ({docs}));
            },
            where: (elementField: string, compareOption: string, constValue: string | number) => {
                if (selectedElementField !== elementField) {
                    throw new Error('Firestore does support multiple where-statements ' +
                        '(except with eq.-operator which is not implemented yet in this mock). ' +
                        'See https://firebase.google.com/docs/firestore/query-data/queries?hl=en-us : ' +
                        'You can perform range (<, <=, >, >=) or not equals (!=) comparisons only on a single field.'
                    );
                }
                const documents = this.getDocumentTitleFilteredByWhere(elementField, compareOption, constValue, paths, filteredDocuments);
                return this.createQuery([...paths], documents, selectedElementField);
            }
        };
    }

    private createBatch(): Batch {
        this.currentBatch = [];
        return {
            set: (doc: Document, content: any) => {
                const paths = doc.path();
                const title = doc.title();
                const promise = this.setDb(content, title, paths);
                this.currentBatch.push(promise);
            },
            commit: () => Promise.all(this.currentBatch).then()
        };
    }

    private setDb(content: Record<string, any>, title: string, paths: string[]): Promise<void> {
        let pointer = this.db;
        paths.forEach(path => {
            if (pointer[path] === undefined) {
                pointer[path] = {};
            }
            pointer = pointer[path];
        });
        pointer[title] = content;
        return new Promise<void>((resolve) => resolve());
    }

    private rmvDb(title: string, paths: string[]): Promise<void> {
        return this.setDb(undefined as any, title, paths);
    }

    private readDb(title: string, paths: string[]): Promise<DocumentSnapshot> {
        let snapshot: DocumentSnapshot;
        try {
            const obj = this.resolvePaths(paths, this.db);
            if (obj[title] === undefined) {
                throw new Error(`Firestore DB:\nTry to access document "${title}" which contain undefined data !\n(paths : ${paths}).`);
            }
            snapshot = {data: () => obj[title], id: title, exists: true};
        } catch (err) {
            snapshot = {data: () => {throw new Error(err);}, id: undefined as any as string, exists: false};
        }
        return new Promise<DocumentSnapshot>((resolve) => resolve(snapshot));
    }

    private updateDb(content: Record<string, any>, title: string, paths: string[]): Promise<void> {
        return this.readDb(title, paths).then(doc => {
            const updatedContent = {...doc.data(), ...content};
            return this.setDb(updatedContent, title, paths);
        });
    }

    private isAlreadyExisting(paths: string[]): boolean {
        let doesAlreadyExist = false;
        try {
            this.resolvePaths(paths, this.db);
            doesAlreadyExist = true;
        } catch (e) {
            //console.log('Already existing doc in firestore mock: ', paths);  // prevent empty catch block lint error ;)
        }
        return doesAlreadyExist;
    }

    private resolvePaths(paths: string[], startObj: any): any {
        let pointer = startObj;
        paths.forEach(path => {
            if (pointer[path] === undefined) {
                throw new Error(`Firestore DB:\nTry to access non existing document of ${path} !\n(paths: ${paths})`);
            }
            pointer = pointer[path];
        });
        return pointer;
    }

    private getNamesOfElementsInPaths(paths: string[]): string[] {
        const obj = this.resolvePaths(paths, this.db);
        return getKeysAs<string>(obj);
    }

    private getDocumentTitleFilteredByWhere(docElementPath: string, compareOption: string, constValue: string | number, paths: string[], elementNames: string[]): string[] {
        const obj = this.resolvePaths(paths, this.db);
        const elementPaths = docElementPath.split('.');
        return elementNames.filter(name => {
            const ele = obj[name];
            const value = this.resolvePaths(elementPaths, ele);
            return FirestoreMock.runCompare(value, compareOption, constValue);
        });
    }
}
