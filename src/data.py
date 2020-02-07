"""
Handling measured response time
"""
from src import config
import numpy as np


CONFLICT = []
NORMAL = []


TEMPLATE = "衝突文字平均：{:.0f} 毫秒\n" + \
"一般文字平均：{:.0f} 毫秒\n" + \
"相差：{:.0f} 毫秒"


def update(res):
    res = res.decode()
    print(f'data received: {res}')
    color, diff = res.split()
    diff = int(diff)
    if color == 'white':
        NORMAL.append(diff)
    else:
        CONFLICT.append(diff)


def clear():
    CONFLICT.clear()
    NORMAL.clear()


def filter_results(arr):
    print(arr)
    arr = np.array(arr)
    if config.CONFIG['Setting']['filter'] and len(arr) >= config.CONFIG['Setting']['min_data_filter']:
        a = config.CONFIG['Setting']['outlier_over_variance']
        std = np.std(arr)
        mean = np.mean(arr)
        remain = arr[np.abs(arr - mean) < std * a]
        print(remain)
        return remain
    return arr


def get_results():
    normal = filter_results(NORMAL)
    conflict = filter_results(CONFLICT)

    m1 = np.mean(conflict)
    m2 = np.mean(normal)
    return TEMPLATE.format(
       m1 , m2, m1 - m2
    ).split('\n')
