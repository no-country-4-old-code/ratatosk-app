from map.content_const import ts_file_exchange_lookup_start, ts_file_end


def map_exchanges_2_ts(exchanges):
    formatted = [_map_exchange_2_ts_format(_) for _ in exchanges]
    ts_content = ',\n'.join(formatted)
    return ts_file_exchange_lookup_start + ts_content + ts_file_end


def _map_exchange_2_ts_format(exchange):
    return '\t"{}": {{ name: "{}", image: "{}"}}'.format(
        exchange['id'], exchange['name'], exchange['image'])
