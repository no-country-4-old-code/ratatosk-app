'''
https://firebase.google.com/pricing
Firestore:
$0.18/100K
$0.06/100K
$0.02/100K
'''
cost_doc_write = 0.18 * 10 ** -5
cost_doc_read = 0.06 * 10 ** -5
cost_doc_delete = 0.02 * 10 ** -5

'''
https://cloud.google.com/functions/pricing
Cloud functions per 100ms:
128MB	200MHz	$0.000000231
256MB	400MHz	$0.000000463
512MB	800MHz	$0.000000925
1024MB	1.4 GHz	$0.000001650
2048MB	2.4 GHz	$0.000002900
4096MB	4.8 GHz	$0.000005800

+

https://firebase.google.com/pricing
$0.40/million per invocation
'''
cost_func_invocation = 0.4 * 10 ** -6
cost_func_256MB_per_1s = 0.000000463 * 10 + cost_func_invocation


'''
Storage download 
$0.004/10k per read (done by function)
'''
cost_storage_read = 0.4 * 10 ** -6


def calculate_cost_per_function_call(cost_of_doc_actions, cost_of_storage_actions, func_execution_time_in_sec):
    return cost_func_256MB_per_1s * func_execution_time_in_sec + cost_of_doc_actions + cost_of_storage_actions


def calculate_cost_per_cycle(num_of_writes, num_of_reads, num_of_deletes, num_of_func_calls, cost_per_function_call):
    cost_docs = cost_doc_write * num_of_writes + cost_doc_read * num_of_reads + cost_doc_delete * num_of_deletes
    cost_funcs = num_of_func_calls * cost_per_function_call
    cost_all = cost_docs + cost_funcs
    print('Cost of funcs relative to sum: {} %'.format(cost_funcs / cost_all * 100))
    return cost_all


def calculate_costs_per_user_per_month(costs_per_cycle, cycles_per_day):
    cost_day = costs_per_cycle * cycles_per_day
    cost_month = cost_day * 31
    print('Cost per month per user are {}'.format(cost_month))
    examples = [1, 10, 100, 1000, 10000, 100000, 1000000]
    for example in examples:
        print('For {0:<9} users : {1}'.format(example, cost_month * example))
    return cost_month


if __name__ == '__main__':
    # ----- old
    # funcs reads UserData (doc), function reads Storage (~4 different metrics), function runs ~ 9 sec
    cost_per_func_call = calculate_cost_per_function_call(cost_doc_read, cost_storage_read * 4, 9)
    # user reads 3 times (UserData, Snapshot, History), user writes 1 time (user data), user execute one function
    cost_per_cycle = calculate_cost_per_cycle(1, 3, 0, 1, cost_per_func_call)
    # user do this every 5 minutes for every day in month
    calculate_costs_per_user_per_month(cost_per_cycle, 12)

    # ----- new
    # Global func is used -> funcs reads UserData (doc) and need ~1 sec for calculation and storage is read for ~500 user at once
    cost_per_func_call = calculate_cost_per_function_call(cost_doc_read, cost_storage_read * 4 / 500, 1)
    # user reads 3 times (UserData, Snapshot, History), user writes 3 time (user data, trigger), user execute one function indirect
    cost_per_cycle = calculate_cost_per_cycle(1, 3, 0, 1, cost_per_func_call)
    # user do this every 5 minutes for every day in month
    calculate_costs_per_user_per_month(cost_per_cycle, 12)
