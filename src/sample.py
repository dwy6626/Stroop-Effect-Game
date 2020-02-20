import random
from src import config


_IS_CONFLICT = False
_REMAIN = 0
_COLOR = ['red', 'green', 'blue']


def is_conflict_text():
    return _IS_CONFLICT


def rotate(l, n):
    return l[n:] + l[:n]


def get_sample():
    global _REMAIN, _IS_CONFLICT
    if _REMAIN == 0:
        return {
            'samples': None,
            'isConflict': None
        }
    _REMAIN -= 1

    # 1st row
    row = _COLOR.copy()
    random.shuffle(row)

    # 2nd and 3rd row
    sign = random.choice([1, -1])
    row2 = rotate(row, sign * 1)
    row3 = rotate(row, sign * 2)

    _IS_CONFLICT = not _IS_CONFLICT
    return {
        'samples': row + row2 + row3,
        'isConflict': _IS_CONFLICT
    }


def reset(path):
    global _REMAIN, _IS_CONFLICT
    _REMAIN = config.CONFIG['Setting'][path[1:]]
    _IS_CONFLICT = random.choice([True, False])
