import time

from pycoingecko import CoinGeckoAPI
import math
# https://www.coingecko.com/api/docs/v3
# price = cg.get_price(ids=['bitcoin'], vs_currencies='usd')
# https://pypi.org/project/pycoingecko/
cg = CoinGeckoAPI()


def get_first_n_ranked_coins(n):
    coins = []
    page_size = 100
    pages = math.ceil(n / page_size)
    for offset in range(pages):
        print('Get page {} of {} pages in coin markets'.format(offset + 1, pages))
        page = 1 + offset
        new_coins = cg.get_coins_markets(vs_currency='usd', order='market_cap_desc', per_page=str(page_size), page=page)
        new_coins = _fill_with_extra_info(new_coins)
        coins += new_coins
    return coins[:n]


def get_coins_of_ids(ids):
    coins = []
    page_size = 100
    pages = math.ceil(len(ids) / page_size)
    for offset in range(pages):
        page = 1 + offset
        new_coins = cg.get_coins_markets(vs_currency='usd', ids=ids, per_page=str(page_size), page=page)
        new_coins = _fill_with_extra_info(new_coins)
        coins += new_coins
    return coins[:len(ids)]


def _fill_with_extra_info(coins):
    time.sleep(5)
    for coin in coins:
        print('> {}% - get extra info for {}'.format(((coins.index(coin) + 1) / len(coins) * 100), coin['id']))
        details = cg.get_coin_by_id(coin['id'])
        coin['categories'] = extract_category(details)
        time.sleep(1)
    return coins


def extract_category(details):
    category = ['Without category']
    given_exchanges = [_ for _ in details['categories'] if _ is not None]
    if len(given_exchanges) > 0:
        category = given_exchanges
    return category