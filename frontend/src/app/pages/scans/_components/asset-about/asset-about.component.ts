import {ChangeDetectionStrategy, Component, Input, OnInit, ViewEncapsulation} from '@angular/core';
import {from, Observable} from 'rxjs';
import {ResponseGeckoCoinFrontend} from '@lib/coin-gecko/interfaces';
import {AssetId} from '@shared_library/datatypes/data';
import {geckoApi} from '@lib/coin-gecko/api';
import {map, shareReplay} from 'rxjs/operators';
import {lookupCoinInfo} from '@shared_library/asset/assets/coin/helper/lookup-coin-info-basic';
import {AssetInfo} from '@shared_library/asset/interfaces-asset';
import {lookupCoinExchangeInfo} from '@shared_library/asset/assets/coin/helper/lookup-exchange-info';

interface Content extends ResponseGeckoCoinFrontend {
    twitterUrl: string;
    repositories: string[];
}

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-asset-about',
  templateUrl: './asset-about.component.html',
  styleUrls: ['./asset-about.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class AssetAboutComponent implements OnInit {
  @Input() id: AssetId<'coin'>;
  content$: Observable<Content>;
  staticCoinInfo: AssetInfo<'coin'>;
  exchanges: string[];

  ngOnInit(): void {
      this.content$ = this.getContent$();
      this.staticCoinInfo = lookupCoinInfo[this.id];
      this.exchanges = this.getExchanges(this.id);
  }

  // private

  private getContent$(): Observable<Content> {
      const response$ = this.getResponse$();
      return response$.pipe(
          map(response => {
              return {...response,
                  description: this.getDescription(response),
                  twitterUrl: this.getTwitterUrl(response),
                  repositories: this.getRepositories(response)
              };
          }),
          shareReplay(1)
    );
  }

  private getExchanges(id: string): string[] {
      const maxNumberDisplayed = 6;
      const exchangeIds = lookupCoinInfo[id].exchanges;
      const numberOfExchanges = exchangeIds.length;
      let exchanges = exchangeIds.map(id => lookupCoinExchangeInfo[id].name);
      if (numberOfExchanges > maxNumberDisplayed) {
          const andMoreSentence = `...and ${numberOfExchanges - maxNumberDisplayed} more !`;
          exchanges = [...exchanges.slice(0, maxNumberDisplayed), andMoreSentence];
      }
      return exchanges;
  }

  private getResponse$(): Observable<ResponseGeckoCoinFrontend> {
      return from(geckoApi.fetch(this.id));
  }

  private getDescription(response: ResponseGeckoCoinFrontend): {'en': string} {
      let description = response.description;
      if (description.en) {
          description = {en: this.adaptDescription(description.en)}
      }
      return description;
  }

  private getTwitterUrl(response: ResponseGeckoCoinFrontend): string {
      let twitterUrl = null;
      if (response.links.twitter_screen_name) {
          twitterUrl = 'https://twitter.com/' + response.links.twitter_screen_name;
      }
      return twitterUrl;
  }

  private getRepositories(response: ResponseGeckoCoinFrontend): string[] {
      return [...response.links.repos_url.github, ...response.links.repos_url.bitbucket];
  }


  private adaptDescription(description: string): string {
      let newDesciption = this.replaceAll(description, '<a href=', '<a class="x-link-color" href=');
      newDesciption = this.replaceAll(newDesciption, '\r\n', '<br>');
      return newDesciption;
  }

  private replaceAll(str: string, searchFor: string, replaceWith: string): string {
      return str.split(searchFor).join(replaceWith);
  }
}
