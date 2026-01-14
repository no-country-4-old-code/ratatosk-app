import {Observable} from 'rxjs';
import {AssetIdCoin} from '../../../../../shared-library/src/asset/assets/coin/interfaces';

interface HotStreamRecord<T> {
    id: AssetIdCoin;
    stream: Observable<T>;
}

export class HotStreamArray<T> {
    private readonly streams: HotStreamRecord<T>[] = [];

    constructor(private createStream: (id: AssetIdCoin) => Observable<T>, private maxSize: number) {
    }

    public getStreamById(id: AssetIdCoin): Observable<T> {
        let idx = this.getIdxOfStream(id);
        if (idx < 0) {
            idx = this.addNewStream(id);
            this.checkSize(this.maxSize);
        }
        return this.streams[idx].stream;
    }

    // private

    private addNewStream(id: AssetIdCoin): number {
        this.streams.unshift({id, stream: this.createStream(id)});
        return 0;
    }

    private checkSize(maxSize: number): void {
        if (this.streams.length > maxSize) {
            this.streams.pop();
        }
    }

    private getIdxOfStream(id: AssetIdCoin): number {
        return this.streams.findIndex(element => element.id === id);
    }
}
