"""
Handling measured response time
"""
from src import config
from src import sample


from pathlib import Path
from datetime import datetime
import json


import numpy as np
import pandas as pd


CONFLICT = []
NORMAL = []


TEMPLATE = "衝突文字平均：{:.0f} 毫秒\n" + \
"一般文字平均：{:.0f} 毫秒\n" + \
"相差：{:.0f} 毫秒"


COLUMNS = [
    '測驗時間日期', '時間差',
    '衝突文字平均', '衝突文字標準差', '一般文字平均', '一般文字標準差'
]


def date_format(dt):
    return dt.strftime('%Y 年 %m 月 %d 日 %H 時 %M 分 %S 秒')


def update(res):
    res = res.decode()
    print(f'data received: {res}')
    res = json.loads(res)
    for tf, td in res:
        if tf == "correct":
            if sample.is_conflict_text():
                CONFLICT.append(td)
            else:
                NORMAL.append(td)


def clear():
    CONFLICT.clear()
    NORMAL.clear()


def filter_results(arr):
    arr = np.array(arr)
    if config.CONFIG['Setting']['filter'] and len(arr) >= config.CONFIG['Setting']['min_data_filter']:
        a = config.CONFIG['Setting']['outlier_over_std']
        std = np.std(arr)
        mean = np.mean(arr)
        remain = arr[np.abs(arr - mean) < std * a]
        return remain
    return arr


def get_results():
    conflict = filter_results(CONFLICT)
    normal = filter_results(NORMAL)

    # no test results
    if normal.size == 0 or conflict.size == 0:
        return pd.Series(
            [datetime.now(), 0, 0, 0, 0, 0], index=COLUMNS
        )

    m1 = np.mean(conflict)
    s1 = np.std(conflict)
    m2 = np.mean(normal)
    s2 = np.std(normal)

    return pd.Series([
        datetime.now(),
        m1 - m2, m1, s1, m2, s2
    ], index=COLUMNS)


def format_results(results):
    return TEMPLATE.format(
       results[COLUMNS[2]], results[COLUMNS[4]], results[COLUMNS[1]]
    ).split('\n')


def record_to_file(results):
    # check file exist
    file_path = Path(config.CONFIG['Setting']['output_file'])
    if not file_path.parent.exists():
        file_path.parent.mkdir(parents=True)
    if not file_path.exists():
        pd.DataFrame(columns=COLUMNS).to_csv(
            path_or_buf=file_path,
            index=False
        )
    print(results)
    pd.DataFrame([results]).to_csv(
        file_path, mode='a', header=False, index=False
    )


def visualize():
    print('plot figure')
    min_size = config.CONFIG['Setting']['minimum_plot_size']
    print(CONFLICT, NORMAL)
    if len(CONFLICT) < min_size or len(NORMAL) < min_size:
        print('not enough data')
        return

    import matplotlib as mpl
    mpl.rcParams.update(config.CONFIG['Plotting'])

    import matplotlib.pyplot as plt
    import seaborn as sns
    fig = plt.figure()
    ax = plt.gca()
    sns.distplot(np.array(CONFLICT) * .1,
                 ax=ax, norm_hist=False, kde=False,
                 label=config.CONFIG['Wording']['line_conflict'])
    sns.distplot(np.array(NORMAL) * .1,
                 ax=ax, norm_hist=False, kde=False,
                 label = config.CONFIG['Wording']['line_normal'])

    print(config.CONFIG['Wording'])
    plt.xlabel(config.CONFIG['Wording']['plot_x'])
    plt.ylabel(config.CONFIG['Wording']['plot_y'])
    plt.legend()

    return fig
