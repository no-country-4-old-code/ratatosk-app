from files.path import get_path_coin_info_ts, get_path_exchange_info_ts


def write_to_coin_info(content, force_overwrite=False):
    path = get_path_coin_info_ts()
    _write(content, force_overwrite, path)


def write_to_exchange_info(content):
    path = get_path_exchange_info_ts()
    _write(content, True, path)


def _write(content, force_overwrite, path):
    mode = 'w' if force_overwrite else 'a'
    with open(path, mode) as file:
        file.write(content)
