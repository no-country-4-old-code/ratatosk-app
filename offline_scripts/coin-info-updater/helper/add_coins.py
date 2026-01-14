from files.path import get_path_asset_coin_images_directory
from files.write import write_to_coin_info
from helper.check import check_status_of_directories, check_backward_compatibility
from helper.update_coins_with_exchange import add_exchanges_to_coins
from map.map_coins_2_ts import map_coins_2_ts
from web_api.get_images import download_and_write_images_of_coins


def add_coins(coins, force_overwrite=False):
    add_exchanges_to_coins(coins)
    dir_images = get_path_asset_coin_images_directory()
    download_and_write_images_of_coins(coins, dir_images)
    content = map_coins_2_ts(coins)
    check_backward_compatibility(content)
    write_to_coin_info(content, force_overwrite)
    check_status_of_directories()

