import { collect, take, range } from './index.js';
import { asyncFibonacci, fibonacci } from './testIterators.fixture.js';
import test from 'tape';

test('collect', async t => {
    t.plan(3)

    t.deepEqual(
        [1, 1, 2, 3, 5, 8, 13, 21, 34, 55],
        await collect(take(10, fibonacci()))
    )

    t.deepEqual(
        [1, 1, 2, 3, 5, 8, 13, 21, 34, 55],
        await collect(take(10, asyncFibonacci()))
    )

    t.deepEqual(
        [0, 1, 2, 3, 4, 5],
        await collect(range(6))
    )
});
