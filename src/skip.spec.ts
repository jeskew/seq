import { collect, range, SyncOrAsyncIterable, skip } from '.';
import { asyncify } from './testIterators.fixture';
import * as test from 'tape';

test('skip', async t => {
    const testCases: Array<[
        number,
        SyncOrAsyncIterable<number>,
        Array<number>
    ]> = [
        [
            10,
            range(11),
            [10],
        ],
        [
            10,
            asyncify(range(11)),
            [10],
        ],
        [
            0,
            range(5),
            [0, 1, 2, 3, 4],
        ],
        [
            0,
            asyncify(range(5)),
            [0, 1, 2, 3, 4],
        ],
    ];

    t.plan(testCases.length)

    for (const [toSkip, iterable, expected] of testCases) {
        t.deepEqual(await collect(skip(toSkip, iterable)), expected)
    }
})
