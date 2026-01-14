from map.content_const import ts_file_coin_lookup_start, ts_file_end


def map_coins_2_ts(coins):
    formatted = [map_coin_2_ts_format(_) for _ in coins]
    ts_content = ',\n'.join(formatted)
    return ts_file_coin_lookup_start + ts_content + ts_file_end


def map_coin_2_ts_format(coin):
    return '\t"{}": {{ name: "{}", symbol: "{}", iconPath: "assets/icons/coins/{}.png", maxSupply: {},' \
           ' categories: {}, exchanges: {} }}'.format(
        coin['id'], coin['name'], coin['symbol'], coin['id'], map_none_2_nan(coin['max_supply']), coin['categories'],
        coin['exchanges'])


def map_none_2_nan(number):
    if number is None:
        return 'NaN'
    else:
        return number