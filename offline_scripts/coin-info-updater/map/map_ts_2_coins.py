from map.content_const import ts_file_end, ts_file_coin_lookup_start
from map.map_coins_2_ts import map_coins_2_ts


def map_ts_2_coins(content):
    extracted = content.replace(ts_file_coin_lookup_start, '').replace(ts_file_end, '')
    coin_info_list = [_ for _ in extracted.split('\t') if len(_) > 0]
    return [map_ts_2_coin_format(_) for _ in coin_info_list]


def map_ts_2_coin_format(content):
    return {
        'id': content.split('":')[0][1:],
        'symbol': content.split('", iconPath')[0].split('symbol: "')[1],
        'name': content.split('", symbol')[0].split('name: "')[1],
        'max_supply': map_nan_2_none(content.split(', categories')[0].split('maxSupply: ')[1]),
        'categories': map_str_to_list(content.split(', exchanges')[0].split(', categories: ')[1]),
        'exchanges': map_str_to_list(content.split('}')[0].split(', exchanges: ')[1])
    }


def map_nan_2_none(number):
    if number == 'NaN':
        return None
    else:
        return float(number)


def map_str_to_list(list_as_str):
    li = list_as_str.strip()[1:-1]
    elements = li.replace("'", '').split(', ')
    return [ele for ele in elements if len(ele) > 0]

# unittest


import unittest


class TestReverseMapping(unittest.TestCase):

    def test_should_revert_empty(self):
        coins = []
        ts = map_coins_2_ts(coins)
        result = map_ts_2_coins(ts)
        self.assertListEqual(result, coins)

    def test_should_revert_full(self):
        coins = [{'id': 'bitcoin', 'symbol': 'btc', 'name': 'Bitcoin', 'max_supply': 21000000.0,
                  'categories': ['Cryptocurrency'], 'exchanges': ['miau']},
                 {'id': 'ethereum', 'symbol': 'eth', 'name': 'Ethereum','max_supply': None,
                  'categories': ['Smart Contract Platform'], 'exchanges': ['wuff waff', 'miau']},
                 {'id': 'tether', 'symbol': 'usdt', 'name': 'Tether', 'max_supply': None,
                  'categories': ['USD Stablecoin', 'Stablecoins'], 'exchanges': []}]

        ts = map_coins_2_ts(coins)
        result = map_ts_2_coins(ts)
        self.assertListEqual(result, coins)
