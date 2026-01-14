import {createArray, createRangeArray} from '../general/array';


type Bitmap = number[] // values between 0 and 255


export function mapIndexes2Bitmap(bitIndexes: number[]): Bitmap {
    if (bitIndexes.length === 0) {
        return [];
    }
    const bitsPerByte = 8;
    const maxBitIndex = Math.max(...bitIndexes);
    const numberOfBytes = Math.ceil((maxBitIndex + 1) / bitsPerByte);
    const bitmap = createArray(numberOfBytes, 0);
    bitIndexes.forEach(idx => {
        const byteIdx = Math.floor(idx / bitsPerByte);
        const bitIdxInByte = idx % bitsPerByte;
        bitmap[byteIdx] += 1 << bitIdxInByte;
    });
    return bitmap;
}

export function mapBitmap2Indexes(bitmap: number[]): number[] {
    const bitsPerByte = 8;
    return bitmap.flatMap((byte, byteIdx) => {
        if (byte > 0) {
            const bitOffset = byteIdx * bitsPerByte;
            return createRangeArray(bitsPerByte, 0)
                .filter(idx => {
                    const bitMask = 1 << idx;
                    return (byte & bitMask) > 0;
                })
                .map(bitIdx => bitIdx + bitOffset);
        } else {
            return [];
        }
    });
}
