import random
from src import config


_IS_CONFLICT = False
_REMAIN = 0
_COLOR = ['red', 'green', 'blue']


def is_conflict_text():
    return _IS_CONFLICT


def rotate(l, n):
    return l[n:] + l[:n]


def check_neighbor_same(ls):
    for i in range(len(ls) - 1):
        if ls[i] == ls[i+1]:
            return True
    return False


def check_line_all_same(ls):
    # e.g. 3, 2, 1
    #      3, 1, 2
    #      3, 2, 1
    # should be not valid
    for i in range(3):
        if ls[0 + i] == ls[3 + i] == ls[6 + i]:
            return True
    return False


def get_sample(constrained=False):
    global _REMAIN, _IS_CONFLICT
    if _REMAIN == 0:
        return {
            'samples': None,
            'isConflict': None
        }
    _REMAIN -= 1
    _IS_CONFLICT = not _IS_CONFLICT

    if constrained:
        # 1st row
        row = list(range(3))
        random.shuffle(row)

        # 2nd and 3rd row
        sign = random.choice([1, -1])
        row2 = rotate(row, sign * 1)
        row3 = rotate(row, sign * 2)
        samples = row + row2 + row3

        # conflict text
        conflict_text = rotate(_COLOR, random.choice([1, 2]))
        conflict_text = [conflict_text[i] for i in samples]
    else:
        # shuffle and assert no neighbor is the same
        samples = list(range(3)) * 3
        random.shuffle(samples)
        while check_neighbor_same(samples) or check_line_all_same(samples):
            random.shuffle(samples)
            print(samples)

        # conflict text
        conflict_text = random.choices([1, 2], k=9)
        conflict_text = [_COLOR[(i + j) % 3] for i, j in zip(conflict_text, samples)]

    return {
        'samples': [_COLOR[i] for i in samples],
        'isConflict': _IS_CONFLICT,
        'conflictTexts': conflict_text
    }


def reset(path):
    global _REMAIN, _IS_CONFLICT
    _REMAIN = config.CONFIG['Setting'][path[1:]]
    _IS_CONFLICT = random.choice([True, False])
