import {lookupAssetFactory} from '../../../src/asset/lookup-asset-factory';
import {deepCopy} from '../../../src/functions/general/object';
import {History, Storage} from '../../../src/datatypes/data';
import {getAssets} from '../../../src/asset/helper/get-assets';
import {AssetType} from '../../../src/asset/interfaces-asset';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const sizeof = require('firestore-size');

describe('Test general compression of ids, snapshot and history', function () {
    let spyLog: jasmine.Spy;

    beforeEach(function () {
        spyLog = spyOn(console, 'error');
    });

    getAssets().forEach((assetType: AssetType) => {
        const seed = Math.round(Math.random() * 1000);
        const asset = lookupAssetFactory[assetType];

        describe(`Ids of ${assetType} asset`, function () {
            const idsAll = asset.getIds();

            it('should work with empty array', function () {
                const compressed = asset.compressIds([]);
                const result = asset.decompressIds(compressed);
                expect(result).toEqual([]);
                expect(spyLog).toHaveBeenCalledTimes(0);
            });

            it('should log error if contain not resolvable ids during compress and filter them', function () {
                const copy = deepCopy(idsAll);
                const compressed = asset.compressIds([...copy, 'miau']);
                const result = asset.decompressIds(compressed);
                expect(result).toEqual(idsAll);
                expect(spyLog).toHaveBeenCalledTimes(1);
            });

            it('should be smaller', function () {
                const compressed = asset.compressIds(idsAll);
                const sizeFull = sizeof(idsAll);
                const sizeCompressed = sizeof(compressed);
                expect(sizeCompressed).toBeLessThan(sizeFull);
            });

            describe('Reversibility testcases', function () {
                const bitsPerByte = 8;
                [
                    [],
                    [idsAll[0]],
                    [idsAll[1]],
                    [idsAll[bitsPerByte - 1]],
                    [idsAll[bitsPerByte]],
                    [idsAll[bitsPerByte + 1]],
                    [idsAll[0], idsAll[1], idsAll[3]],
                    [idsAll[bitsPerByte - 1], idsAll[bitsPerByte], idsAll[bitsPerByte + 1]],
                    idsAll.slice(0, idsAll.length - 1),
                    idsAll.slice(1, idsAll.length - 1),
                    idsAll.slice(1, idsAll.length),
                    [idsAll[idsAll.length - 2]],
                    [idsAll[idsAll.length - 1]],
                    idsAll
                ].forEach((ids, testCaseIdx) => {

                    it(`should be reversible for ${ids.length} ids (testcase idx = ${testCaseIdx})`, function () {
                        const copy = deepCopy(ids);
                        const compressed = asset.compressIds(copy);
                        const result = asset.decompressIds(compressed);
                        expect(result).toEqual(ids);
                    });
                });
            });

        });

        describe(`Storage of Snapshots of ${assetType} asset (tested with seed ${seed})`, function () {
            let storage: Storage<any, 'SNAPSHOT'>;

            beforeEach(function () {
                storage = asset.createDummyStorageSnapshot(asset.getIds(), seed);
            });

            it('should be reversible ', function () {
                const copy = deepCopy(storage);
                const compressed = asset.compressStorageSnapshot(copy);
                const result = asset.decompressStorageSnapshot(compressed);
                expect(storage).toEqual(result);
            });

            it('should be smaller', function () {
                const compressed = asset.compressStorageSnapshot(storage);
                const sizeFull = sizeof(storage);
                const sizeCompressed = sizeof(compressed);
                expect(sizeCompressed).toBeLessThan(sizeFull);
            });

            // backward compatibility is not important for snapshot and history (rewritten every cycle)
        });

        describe(`History of ${assetType} asset (tested with seed ${seed})`, function () {
            let history: History<any>;

            beforeEach(function () {
                history = asset.createDummyHistory(seed);
            });

            it('should be reversible ', function () {
                const copy = deepCopy(history);
                const compressed = asset.compressHistory(copy);
                const result = asset.decompressHistory(compressed);
                expect(history).toEqual(result);
            });

            it('should be smaller', function () {
                const compressed = asset.compressHistory(history);
                const sizeFull = sizeof(history);
                const sizeCompressed = sizeof(compressed);
                expect(sizeCompressed).toBeLessThan(sizeFull);
            });

            // backward compatibility is not important for snapshot and history (rewritten every cycle)
        });

        describe(`PreSelection of ${assetType} asset`, function () {
            asset.getPreSelectionAssetParams().forEach(param => {

                describe(`Test compress/ decompress for param ${param}`, function () {
                    const bitsPerByte = 8;
                    const helper = asset.getPreSelectionHelper(param);
                    const options = helper.getOptions();

                    [
                        [],
                        [options[0]],
                        [options[1]],
                        [options[bitsPerByte - 1]],
                        [options[bitsPerByte]],
                        [options[bitsPerByte + 1]],
                        [options[0], options[1], options[3]],
                        [options[bitsPerByte - 1], options[bitsPerByte], options[bitsPerByte + 1]],
                        options.slice(0, options.length - 1),
                        options.slice(1, options.length - 1),
                        options.slice(1, options.length),
                        [options[options.length - 2]],
                        [options[options.length - 1]],
                        options
                    ].forEach((ids, testCaseIdx) => {

                        it(`should be reversible for ${ids.length} ids (testcase idx = ${testCaseIdx})`, function () {
                            const copy = deepCopy(ids);
                            const blueprint = asset.createDefaultPreSelection();
                            blueprint[param] = copy;
                            const compressed = asset.compressPreSelection(blueprint);
                            const result = asset.decompressPreSelection(compressed);
                            expect(result[param]).toEqual(ids);
                        });
                    });
                });
            });
        });
    });
});
