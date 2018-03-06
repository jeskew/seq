import { range, includes } from '.';
import { asyncify } from './testIterators.fixture';
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

    t.plan(testCases.length)

    for (const [iterable, searchElement, expectedResult] of testCases) {
        t.equal(
            await includes(searchElement, iterable),
            expectedResult
        )
    }
})
