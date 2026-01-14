// This file is required by karma.conf.js and loads recursively all the .spec and framework files

import 'zone.js/testing';
import {getTestBed} from '@angular/core/testing';
import {BrowserDynamicTestingModule, platformBrowserDynamicTesting} from '@angular/platform-browser-dynamic/testing';
import {
  setUpLookupCoinInfoMock
} from '../../shared-library/src/functions/test-utils/lookup-coin-info-mocker/lookup-coin-info-mocker';
import {AssetInfo, LookupAssetInfo} from '@shared_library/asset/interfaces-asset';
import {getTestCategories} from '@shared_library/functions/test-utils/dummy-data/asset/category';
import {getTestCoinExchanges} from '@shared_library/functions/test-utils/dummy-data/asset/exchanges';


declare const require: any;

// First, initialize the Angular testing environment.
getTestBed().initTestEnvironment(
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting()
);

// Then we set up our environment
function createInfo(name: string, symbol: string, iconPath: string, maxSupply: number, seed: number): AssetInfo<'coin'> {
  const path = 'assets/icons/coins/';
  return {name, symbol, iconPath: path + iconPath, maxSupply, categories: getTestCategories(seed), exchanges: getTestCoinExchanges(seed)};
}

const lookupCoinInfoMocked: LookupAssetInfo<'coin'> = {
  'id0'   : createInfo('Moo Coin', 'MCO', 'bitcoin.png', 12345678, 0),
  'id1'   : createInfo('Boo Coin', 'BCO', 'coin1.png', 87654321, 1),
  'id2'   : createInfo('Evil Coin', 'EVI', 'coin1.png', 12345.67890, 2),
  'id42'  : createInfo('Bi', 'CCO', 'coin2.png', 98765, 3),
  'id103' : createInfo('Bitcoin', 'DCO', 'ethereum.png', 1234567, 4),
  'id123' : createInfo('Foo Coin', 'FCO', 'pound.png', 564788, 5),
  // needed to be compatible to hardcoded freeOptionsCoinIds
  'bitcoin'  : createInfo('Bitcoin2', 'BTC', 'ethereum.png', 1, 1),
  'ethereum' : createInfo('Ethereum', 'ETH', 'ethereum.png', 2, 2),
  'dogecoin' : createInfo('Dogecoin', 'DOG', 'ethereum.png', 3, 3),
};
setUpLookupCoinInfoMock(lookupCoinInfoMocked);

// Then we find all the app.
const context = require.context('./', true, /\.spec\.ts$/);
// And load the login-screen.
context.keys().map(context);
