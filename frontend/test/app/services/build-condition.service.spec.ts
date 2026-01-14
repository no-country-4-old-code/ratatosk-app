import {marbleRun} from '@test/helper-frontend/marble/functions.spec';
import {buildAllMocks, MockControlArray} from '@test/helper-frontend/mocks/all';


describe('BuildConditionsService', () => {
  let mocks: MockControlArray;

  beforeEach(function () {
    mocks = buildAllMocks();
  });

  describe('Test startup', function () {

    it('should start with default scan', () => marbleRun( env => {
    }));

  });
});
