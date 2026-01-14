import shutil
import requests


def download_and_write_images_of_coins(coins, dest_directory):
    for coin in coins:
        id = coin['id']
        url = coin['image']
        if url is not None:
            image_name = '{}/{}.png'.format(dest_directory, id)
            _download_and_write_image(url, image_name)
        else:
            print('Error: No image for {}'.format(id))
        print(coin['image'])


# private


def _download_and_write_image(url, name):
    response = requests.get(url, stream=True)
    with open(name, 'wb') as out_file:
        shutil.copyfileobj(response.raw, out_file)
    del response