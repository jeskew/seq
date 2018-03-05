import { collect, distinct, take } from '.';
import { asyncFibonacci, fibonacci } from './testIterators.fixture';
import * as test from 'tape';

test('distinct', async t => {
    t.plan(2)

    t.deepEqual(
        [1, 2, 3, 5],
        await collect(distinct(take(5, fibonacci())))
    )

    t.deepEqual(
        [1, 2, 3, 5],
        await collect(distinct(take(5, asyncFibonacci())))
    )
})
