import json
from files.path import get_path_to_local_database_of_coin_exchanges
import os.path


def is_there_already_a_exchange_dataset_in_local_db():
    path = get_path_to_local_database_of_coin_exchanges()
    return os.path.isfile(path)


def read_exchanges_from_local_db():
    path = get_path_to_local_database_of_coin_exchanges()
    return _read_from_local_db(path)


def _read_from_local_db(path):
    file = open(path, "r")
    wrapped = json.load(file)
    print('Read file from ', wrapped['date'], ' from ', path)
    return wrapped['content']