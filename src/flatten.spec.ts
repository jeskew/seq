import { collect, flatten } from '.';
import { asyncify } from './testIterators.fixture';
import * as test from 'tape';

test('flatten', async t => {
    t.plan(3)

    t.deepEqual(
        await collect(flatten(asyncify([[0], [1, 2], 3]))),
        [0, 1, 2, 3],
        'flattens async iterables'
    )

    t.deepEqual(
        await collect(flatten(5, [[[[[[[0]]]]]], [1, 2], 3])),
        [[0], 1, 2, 3],
        'flattens to a specified depth'
    )

    t.deepEqual(
        await collect(flatten(
            Infinity,
            [[[[[[[[[[['an']]]]]]]]]], ['iterable', 'of'], 'strings']
        )),
        ['an', 'iterable', 'of', 'strings'],
        'does not flatten strings'
    )
})
