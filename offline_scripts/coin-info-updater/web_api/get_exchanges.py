import time
import math
from pycoingecko import CoinGeckoAPI

# https://www.coingecko.com/api/docs/v3
# price = cg.get_price(ids=['bitcoin'], vs_currencies='usd')
# https://pypi.org/project/pycoingecko/
from files.read_from_local_db import read_exchanges_from_local_db, is_there_already_a_exchange_dataset_in_local_db
from files.write_to_local_db import write_exchanges_to_local_db

cg = CoinGeckoAPI()


def get_exchanges():
    if is_there_already_a_exchange_dataset_in_local_db():
        print('Proceed with sampling')
        exchanges_all = read_exchanges_from_local_db()
    else:
        print('Start new sampling')
        assert False, 'Make sure you ensure backend compatibility for exchanges before updating this' \
                      ' (like coin ids, exchanges are compressed using their order)'
        exchanges_all = _get_exchanges_without_supported_coins()

    for idx, exchange in enumerate(exchanges_all):
        if 'coins' not in exchange:
            print('Start with exchange {} ({}%)'.format(exchange['name'], idx / len(exchanges_all) * 100))
            exchange['coins'] = _get_supported_coin_ids_of_exchange(exchange['id'])
            print('Finish ! Exchange {} supports {} coins (idx: {})'.format(exchange['name'], len(exchange['coins']), idx))
            write_exchanges_to_local_db(exchanges_all)

    return exchanges_all


# private

def _get_exchanges_without_supported_coins():
    max_number_of_exchanges = len(cg.get_exchanges_id_name_list())
    print('There are {} exchanges'.format(max_number_of_exchanges))
    number_of_pages = math.ceil(max_number_of_exchanges / 100)
    exchanges = []
    for page in range(number_of_pages):
        exchanges += cg.get_exchanges_list(page=page)
    return exchanges


def _get_supported_coin_ids_of_exchange(exchange_id):
    coins = []
    page_count = 0
    has_read_all = False
    while not has_read_all:
        ticker = cg.get_exchanges_tickers_by_id(id=exchange_id, page=page_count)
        new_coins = _extract_coin_ids_from_ticker(ticker)
        has_read_all = _has_read_all_ticker_of_exchange(ticker)
        coins += new_coins
        page_count += 1
        time.sleep(page_count)  # sleep longer if more requests on one page
    return list(set(coins))


def _extract_coin_ids_from_ticker(response):
    tickers = response['tickers']
    src_coin_ids = _map_to_attribute('coin_id', tickers)
    dest_coin_ids = _map_to_attribute('target_coin_id', tickers)
    coin_ids = dest_coin_ids + src_coin_ids
    return list(set(coin_ids))


def _map_to_attribute(attr, array):
    filtered = [element for element in array if attr in element]
    return [element[attr] for element in filtered]


def _has_read_all_ticker_of_exchange(ticker):
    return len(ticker['tickers']) == 0


if __name__ == '__main__':
    get_exchanges()

