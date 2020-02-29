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


LITERATURE_NORMAL = [5, 39, 34, 13, 9, 1]
LITERATURE_CONFLICT = [0, 0, 5, 2, 7, 16, 25, 16, 13, 7, 4, 3]
LITERATURE_BASE = 40


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


def check_create_output_file():
    # check file exist
    file_path = Path(config.CONFIG['Setting']['output_file'])
    if not file_path.parent.exists():
        file_path.parent.mkdir(parents=True)
    if not file_path.exists():
        pd.DataFrame(columns=COLUMNS).to_csv(
            path_or_buf=file_path,
            index=False
        )
    return file_path


def record_to_file(results):
    file_path = check_create_output_file()
    print(results)
    pd.DataFrame([results]).to_csv(
        file_path, mode='a', header=False, index=False
    )


def visualize():
    print('plot figure')
    min_size = config.CONFIG['Setting']['minimum_plot_size']
    print("Conflict", CONFLICT)
    print("Normal", NORMAL)
    if len(CONFLICT) < min_size or len(NORMAL) < min_size:
        print('not enough data')
        return

    import matplotlib.pyplot as plt
    import seaborn as sns
    fig = plt.figure()
    ax = plt.gca()
    sns.distplot(np.array(CONFLICT) * .1,
                 ax=ax, norm_hist=False, kde=False,
                 label=config.CONFIG['Wording']['line_conflict'])
    sns.distplot(np.array(NORMAL) * .1,
                 ax=ax, norm_hist=False, kde=False,
                 label=config.CONFIG['Wording']['line_normal'])

    plt.xlabel(config.CONFIG['Wording']['plot_x'])
    plt.ylabel(config.CONFIG['Wording']['plot_y'])
    plt.legend()

    return fig


def literature_replot(
        color_normal='#ff7f0e', color_conflict='#1f77b4'
):
    exp_results = get_results()
    mean_normal = exp_results[COLUMNS[4]] * .1
    mean_conflict = exp_results[COLUMNS[2]] * .1

    print('plot result to literature')
    import matplotlib.pyplot as plt
    fig = plt.figure()

    # align to longer one
    normal = np.zeros(max([len(LITERATURE_NORMAL), len(LITERATURE_CONFLICT)]))
    conflict = normal.copy()
    normal[:len(LITERATURE_NORMAL)] = LITERATURE_NORMAL
    conflict[:len(LITERATURE_CONFLICT)] = LITERATURE_CONFLICT
    xx = np.arange(normal.size)

    bar_params = {
        "width": 1,
        "align": 'edge',
        'alpha': .5,
    }
    plt.bar(
        xx , conflict, fc=color_conflict,
        label=config.CONFIG['Wording']['line_conflict'],
        **bar_params
    )
    plt.bar(
        xx, normal, fc=color_normal,
        label=config.CONFIG['Wording']['line_normal'],
        **bar_params
    )

    # extra label
    max_normal = max(LITERATURE_NORMAL)
    max_conflict = max(LITERATURE_CONFLICT)
    maximum = max([max_conflict, max_normal])
    arrow_params = {
        'head_width' : .2,
        'head_length': 1,
        'ec': (0, 0, 0, .5),
    }
    def position_transform(m):
        return (m - LITERATURE_BASE) / 10
    ratio_arrow = 1.05
    arrow_from_bottom = maximum * 0.05
    plt.arrow(
       position_transform(mean_normal), max_normal * ratio_arrow,
        0, -max_normal * ratio_arrow + arrow_from_bottom,
        fc=color_normal, **arrow_params
    )
    plt.text(
        position_transform(mean_normal), max_normal * ratio_arrow,
        config.CONFIG['Wording']['arrow_normal']
    )
    plt.arrow(
        position_transform(mean_conflict), max_conflict * ratio_arrow,
        0, -max_conflict * ratio_arrow + arrow_from_bottom,
        fc=color_conflict, **arrow_params
    )
    plt.text(
        position_transform(mean_conflict), max_conflict * ratio_arrow,
        config.CONFIG['Wording']['arrow_conflict']
    )
    ticks = np.arange(xx.size + 1)

    plt.ylim(0, maximum * 1.2)
    plt.xticks(ticks, [LITERATURE_BASE + 10 * i for i in range(ticks.size)])
    plt.xlabel(config.CONFIG['Wording']['plot_x'])
    plt.ylabel(config.CONFIG['Wording']['plot_y'])
    plt.legend()

    return fig


def plot_all_local_results():
    print('plot figure')
    file_path = check_create_output_file()
    df = pd.read_csv(file_path)
    print(df)

    import matplotlib.pyplot as plt
    import seaborn as sns
    fig = plt.figure()
    ax = plt.gca()
    bins = np.arange(
        LITERATURE_BASE / 10,
        max([len(LITERATURE_NORMAL), len(LITERATURE_CONFLICT)]) + LITERATURE_BASE / 10
    ) * 10

    sns.distplot(df[COLUMNS[2]] * .1, bins=bins,
                 ax=ax, norm_hist=False, kde=False,
                 label=config.CONFIG['Wording']['line_conflict'])
    sns.distplot(df[COLUMNS[4]] * .1, bins=bins,
                 ax=ax, norm_hist=False, kde=False,
                 label=config.CONFIG['Wording']['line_normal'])

    plt.xticks(bins)
    plt.xlabel(config.CONFIG['Wording']['plot_x'])
    plt.ylabel(config.CONFIG['Wording']['plot_y'])
    plt.legend()

    return fig
