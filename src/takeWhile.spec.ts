import { collect, takeWhile, range } from '.';
import { asyncFibonacci } from './testIterators.fixture';
import * as test from 'tape';

test('takeWhile', async t => {
    t.plan(2)

    t.deepEqual(
        await collect(takeWhile((arg: number) => arg < 5, range(10))),
        [0, 1, 2, 3, 4],
        'should limit iteration of sync iterables'
    )

    t.deepEqual(
        await collect(takeWhile((arg: number) => arg < 100, asyncFibonacci())),
        [1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89],
        'should limit iteration of async iterables'
    )
})
