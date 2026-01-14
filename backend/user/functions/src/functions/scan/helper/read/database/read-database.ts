import {Scan} from '../../../../../../../../../shared-library/src/scan/interfaces';
import {CloudStorageHistoryPathInfo, getHistoryDependencyOfScans} from '../../../../../helper/get-history-dependency';
import {AssetDatabase} from '../../interfaces';
import {HistoryWithId} from '../../../../../../../../../shared-library/src/datatypes/data';
import {readCoinDataBucket} from './read-coin-data';
import {Meta} from '../../../../../../../../../shared-library/src/datatypes/meta';

export function readDatabase(scans: Scan[]): Promise<AssetDatabase> {
    // Note: optional needed content -> every read*Bucket should handle needed content itself and return empty bucket if nothing there
    const neededContent = getDependencies(scans);
    const promises: Promise<Meta<HistoryWithId<any>[]>>[] = [
        readCoinDataBucket(neededContent)
    ];
    return Promise.all(promises).then(([bucketCoin]) => {
        return {
            coin: bucketCoin
        };
    });
}

// private

function getDependencies(scans: Scan[]): CloudStorageHistoryPathInfo[] | undefined {
    // make it more robust against malformed user data
    let info = undefined;
    try {
        info = getHistoryDependencyOfScans(scans);
    } catch (e) {
        console.error(`Error during getDependencies caused by at least one malformed scan: ${e}`);
    }
    return info;
}