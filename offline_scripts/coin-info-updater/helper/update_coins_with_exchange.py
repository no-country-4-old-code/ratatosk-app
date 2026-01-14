from files.read import read_coin_info
from files.read_from_local_db import read_exchanges_from_local_db
from files.write import write_to_exchange_info, write_to_coin_info
from map.map_coins_2_ts import map_coins_2_ts
from map.map_exchanges_2_ts import map_exchanges_2_ts
from map.map_ts_2_coins import map_ts_2_coins


def update_coins_with_exchange():
    content_old = read_coin_info()
    coins = map_ts_2_coins(content_old)
    coins = add_exchanges_to_coins(coins)
    content_new = map_coins_2_ts(coins)
    write_to_coin_info(content_new, True)
    _add_exchange_lookup_file()


def add_exchanges_to_coins(coins):
    exchanges = read_exchanges_from_local_db()
    for coin in coins:
        id = coin['id']
        coin['exchanges'] = list(set([e['id'] for e in exchanges if id in e['coins']]))
    return coins


def _add_exchange_lookup_file():
    exchanges = read_exchanges_from_local_db()
    content = map_exchanges_2_ts(exchanges)
    write_to_exchange_info(content)
