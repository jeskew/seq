import { range, repeat, SyncOrAsyncIterable, take } from '.';
import { asyncify, throwOnIteration } from './testIterators.fixture';
import * as test from 'tape';

test('take', async t => {
    const testCases: Array<[number, SyncOrAsyncIterable<any>]> = [
        [10, repeat('foo')],
        [10, asyncify(repeat('foo'))],
        [10, range(5)],
        [10, asyncify(range(5))],
        [0, throwOnIteration()],
    ];

    t.plan(testCases.length)

    for (const [limit, iterable] of testCases) {
        let count = 0
        for await (const _ of take(limit, iterable)) {
            count++
        }

        t.assert(
            count <= limit,
            `should fetch at most ${limit} elements from the source iterable`
        )
    }
})
