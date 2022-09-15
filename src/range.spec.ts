import { range } from './index.js';
import test from 'tape';

test('range', async t => {
    t.plan(4)

    t.deepEqual(
        [...range(10)],
        [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
        'ranges with only an upper bound specified'
    )

    t.deepEqual(
        [...range(5, 10)],
        [5, 6, 7, 8, 9],
        'ranges with an upper and lower bound specified'
    )

    t.deepEqual(
        [...range(0, 20, 3)],
        [0, 3, 6, 9, 12, 15, 18],
        'ranges with a custom step value'
    )

    t.deepEqual(
        [...range(10, 0, -1)],
        [10, 9, 8, 7, 6, 5, 4, 3, 2, 1],
        'ranges with a negative step value'
    )
})
