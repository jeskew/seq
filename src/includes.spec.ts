import { range, includes } from '.';
import { asyncify, AsyncFibonacciSequence } from './testIterators.fixture';
import * as test from 'tape';

test('includes', async t => {
    const testCases: Array<[Iterable<number>|AsyncIterable<number>, number, boolean]> = [
        [
            range(0, 10, 2),
            5,
            false,
        ],
        [
            range(0, 10),
            5,
            true,
        ],
        [
            asyncify(range(0, 10, 2)),
            5,
            false,
        ],
        [
            asyncify(range(0, 10)),
            5,
            true,
        ],
    ];

    t.plan(testCases.length + 1)

    for (const [iterable, searchElement, expectedResult] of testCases) {
        t.equal(
            await includes(searchElement, iterable),
            expectedResult
        )
    }

    t.equal(
        await includes(34, new AsyncFibonacciSequence),
        true,
        'should handle terminating async iterators with no defined .return method'
    )
})
