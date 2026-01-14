from files.read import read_coin_info
from map.map_ts_2_coins import map_ts_2_coins


def filter_not_already_in_file(coins):
    ids_to_add = _map_2_ids(coins)
    ids_already_exist = _map_2_ids(get_coins_of_file())
    return [id for id in ids_to_add if id not in ids_already_exist]


def get_coins_of_file():
    content = read_coin_info()
    return map_ts_2_coins(content)


# private


def _map_2_ids(coins):
    return [_['id'] for _ in coins]