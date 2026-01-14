from files.path import get_path_coin_info_ts, get_path_asset_coin_images_directory
from files.read import read_coin_info, read_names_of_images
from helper.coins_in_file import get_coins_of_file
from map.map_ts_2_coins import map_ts_2_coins


def check_status_of_directories():
    deploy_dirs = [get_path_coin_info_ts(), get_path_asset_coin_images_directory()]
    print('Check status of deploy directories: {}'.format(deploy_dirs))
    err_msg = ''
    err_msg += _check_if_file_has_only_unique_coin_ids()
    err_msg += _check_if_there_is_exact_one_image_for_each_id()
    err_msg += _check_if_file_not_exceed_coin_ids()
    assert len(err_msg) == 0, 'Error detected: ' + err_msg


def check_backward_compatibility(new_content):
    current_content = read_coin_info()
    err_msg = ''
    if not new_content.startswith(current_content):
        err_msg += 'Critical Error ! The backward compatibility to the old compressed coin ids is broken. ' \
                   'Why you should care ? Because every user holds coin ids in compressed format in their user data.' \
                   'This will result in a big crash (best case) or a silent misinterpretation caused by wrong' \
                   ' decompression (worst case) as soon as any user uses the app'
        assert False, 'Error detected: ' + err_msg

# private


def _check_if_file_has_only_unique_coin_ids():
    ids = _get_ids_of_file()
    non_unique_ids = [_ for _ in ids if ids.count(_) > 1]
    err_msg = ''
    if len(non_unique_ids) > 0:
        err_msg += 'Detect non-unique ids in lookup info: {}'.format(non_unique_ids)
    return err_msg


def _check_if_there_is_exact_one_image_for_each_id():
    ids = _get_ids_of_file()
    images = _get_images_names()
    err_msg = ''
    ids_without_image = [_ for _ in ids if _ not in images]
    images_without_id = [_ for _ in images if _ not in ids]
    if len(ids_without_image) > 0:
        err_msg += 'Detect ids in lookup info without a image in assets: {}'.format(ids_without_image)
    if len(images_without_id) > 0:
        err_msg += 'Detect redundant images in assets: {}'.format(images_without_id)
    return err_msg


def _check_if_file_not_exceed_coin_ids():
    ids = _get_ids_of_file()
    err_msg = ''
    if len(ids) > 1000:
        err_msg += 'Warning ! 1000 coins would lead to 20 calls during update phase. ' \
                   'Additional to this we have ~50 calls for updating special values ' \
                   '+ sometime 6 calls to init coin. ' \
                   'There are thresholds like not more then 10 requests/sec or 100 req / min.' \
                   'Currently we have nothing to protect us for the 100 request / minute limit.' \
                   'If we reach it the whole database might freeze...(very very bad).' \
                   'Currently we have {} ids'.format(len(ids))
    return err_msg


def _get_ids_of_file():
    coins = get_coins_of_file()
    return [_['id'] for _ in coins]


def _get_images_names():
    images = read_names_of_images()
    return [_.replace('.png', '') for _ in images]
