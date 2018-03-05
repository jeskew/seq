import { collect, take } from '.';
import { asyncFibonacci, fibonacci } from './testIterators.fixture';
import * as test from 'tape';

test('collect', async t => {
    t.plan(2)

    t.deepEqual(
        [1, 1, 2, 3, 5, 8, 13, 21, 34, 55],
        await collect(take(10, fibonacci()))
    )

    t.deepEqual(
        [1, 1, 2, 3, 5, 8, 13, 21, 34, 55],
        await collect(take(10, asyncFibonacci()))
    )
})
