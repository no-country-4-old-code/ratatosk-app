from files.path import get_path_coin_info_ts, get_path_asset_coin_images_directory
from os import listdir
from os.path import isfile, join


def read_coin_info():
    path = get_path_coin_info_ts()
    with open(path, 'r') as file:
        content = file.read()
    return content


def read_names_of_images():
    path = get_path_asset_coin_images_directory()
    return [f for f in listdir(path) if isfile(join(path, f))]
