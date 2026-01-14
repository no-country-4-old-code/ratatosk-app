import json
from files.path import get_path_to_local_database_of_coin_exchanges
from datetime import date


def write_exchanges_to_local_db(data):
    path = get_path_to_local_database_of_coin_exchanges()
    return _write_to_local_db(path, data)


def _write_to_local_db(path, data):
    today_str = date.today().strftime("%d/%m/%Y")
    data = {'date': today_str, 'content': data}
    file = open(path, "w")  # always overwrite with option w
    json.dump(data, file)
    print('Write to file  @ ', today_str, ' on path ', path)
