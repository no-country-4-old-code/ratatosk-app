import pathlib


def get_path_coin_info_ts():
    path = '/src/asset/assets/coin/helper/lookup-coin-info-basic.ts'
    return _get_path_shared() + path


def get_path_exchange_info_ts():
    path = '/src/asset/assets/coin/helper/lookup-exchange-info.ts'
    return _get_path_shared() + path


def get_path_asset_coin_images_directory():
    path = '/src/assets/icons/coins'
    return _get_path_frontend() + path


def get_path_to_local_database_of_coin_exchanges():
    path = '/exchanges.json'
    return _get_path_to_local_database() + path


# private


def _get_path_frontend():
    return _get_path_develop_dir() + '/frontend'


def _get_path_shared():
    return _get_path_develop_dir() + '/shared-library'


def _get_path_to_local_database():
    return _get_path_develop_dir() + '/offline_scripts/coin-info-updater/database'


def _get_path_develop_dir():
    dest_dir = 'app'
    path = pathlib.Path(__file__).parent.absolute()
    if dest_dir not in str(path):
        raise Exception('Path {} is not in directory anymore'.format(dest_dir))
    while not str(path).endswith(dest_dir):
        path = pathlib.Path(path).parent
    return str(path)
