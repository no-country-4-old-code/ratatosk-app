from files.read_from_local_db import read_exchanges_from_local_db
from files.write_to_local_db import write_exchanges_to_local_db
from helper.add_coins import add_coins
from helper.coins_in_file import filter_not_already_in_file
from helper.update_coins_with_exchange import update_coins_with_exchange
from web_api.get_coins import get_first_n_ranked_coins, get_coins_of_ids
from web_api.get_exchanges import get_exchanges


def init_with_first_ranked_coins(n):
    coins = get_first_n_ranked_coins(n)
    add_coins(coins, force_overwrite=True)


def add_given_coins(coin_ids):
    new_ids = filter_not_already_in_file(coin_ids)
    coins = get_coins_of_ids(new_ids)
    add_coins(coins, force_overwrite=False)
    update_coins_with_exchange()


def update_local_database_exchanges():
    exchanges = get_exchanges()
    write_exchanges_to_local_db(exchanges)


def update_coins_with_exchange_data():
    update_coins_with_exchange()


if __name__ == '__main__':
    # orientate  /search/trending on gecko coin api
    # init_with_first_ranked_coins(600)
    update_coins_with_exchange_data()
