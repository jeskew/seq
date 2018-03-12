import { range, some } from '.';
import { asyncify, AsyncFibonacciSequence } from './testIterators.fixture';
import * as test from 'tape';

test('some', async t => {
    const testCases: Array<[
        Iterable<number>|AsyncIterable<number>,
        (arg: number) => boolean|Promise<boolean>,
        boolean
    ]> = [
        [
            range(1, 10),
            (num: number) => Promise.resolve(num % 2 === 0),
            true,
        ],
        [
            range(1, 10, 2),
            (num: number) => num % 2 === 0,
            false,
        ],
        [
            asyncify(range(1, 10)),
            (num: number) => num % 2 === 0,
            true,
        ],
        [
            asyncify(range(1, 10, 2)),
            (num: number) => Promise.resolve(num % 2 === 0),
            false,
        ],
    ];

    t.plan(testCases.length + 1)

    for (const [iterable, predicate, expected] of testCases) {
        t.equal(await some(predicate, iterable), expected)
    }

    t.equal(
        await some(() => true, new AsyncFibonacciSequence),
        true,
        'should handle terminating async iterators with no defined .return method'
    )
})
