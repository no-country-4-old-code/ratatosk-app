import {UserData} from '../../datatypes/user';
import {CompressedUserData} from '../../datatypes/compress';
import {compressScans, decompressScans} from './compress-scan';

export function compressUser(user: Partial<UserData>): Partial<CompressedUserData> {
    const partialCompressedUser = {} as CompressedUserData;
    if (user.scans !== undefined) {
        partialCompressedUser.scans = compressScans(user.scans);
    }
    return {...user, ...partialCompressedUser};
}

export function decompressUser(compressed: CompressedUserData): UserData {
    return {
        ...compressed,
        scans: decompressScans(compressed.scans)
    };
}
