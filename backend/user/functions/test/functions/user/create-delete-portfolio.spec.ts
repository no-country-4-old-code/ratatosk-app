import {useFirestoreMock} from '../../../../../shared-backend-library/src/test-utils/firestore-mock/use-firestore-mock';
import {readPortfolioWallet} from '../../../src/helper/firestore/read';
import {disableConsoleLog} from '../../test-utils/disable-console-log';
import {createInitialPortfolio} from '../../../src/functions/user/portfolio/create-portfolio';
import {deletePortfolioData} from '../../../src/functions/user/portfolio/delete-portfolio';
import {PortfolioWallet} from '../../../../../../shared-library/src/datatypes/portfolio';
import {haveAsyncFunctionThrownError} from '../../../../../../shared-library/src/functions/test-utils/expect-async';

describe('Test create and delete of portfolio', function () {
    const uidAlice = 'alice';

    beforeEach(async function () {
        disableConsoleLog();
        useFirestoreMock();
    });

    async function readPortfolioAlice(): Promise<PortfolioWallet> {
        const wallet = await readPortfolioWallet(uidAlice);
        return wallet;
    }

    it('should start with no portfolio data', async function () {
        const hasThrownError = await haveAsyncFunctionThrownError(readPortfolioAlice);
        expect(hasThrownError).toBeTruthy();
    });

    it('should create portfolio data', async function () {
        await createInitialPortfolio(uidAlice);
        const hasThrownError = await haveAsyncFunctionThrownError(readPortfolioAlice);
        expect(hasThrownError).toBeFalsy();
    });

    it('should create portfolio data as empty array', async function () {
        await createInitialPortfolio(uidAlice);
        const portfolio = await readPortfolioAlice();
        const expected: PortfolioWallet = {portfolios: []};
        expect(portfolio).toEqual(expected);
    });

    it('should delete portfolio data', async function () {
        await createInitialPortfolio(uidAlice);
        await deletePortfolioData(uidAlice);
        const hasThrownError = await haveAsyncFunctionThrownError(readPortfolioAlice);
        expect(hasThrownError).toBeTruthy();
    });
});
