import {AppPage} from './app.po';

describe('workspace-project App', () => {
  let page: AppPage;

  // TODO: CHeck fault console !!! to detect backend / frontend stuff (not enought scans calculated etc)

  beforeEach(() => {
    page = new AppPage();
  });

  it('should display-all welcome message', () => {
    page.navigateTo();
    expect(page.getTitleText()).toEqual('Welcome to develop!');
  });
});
