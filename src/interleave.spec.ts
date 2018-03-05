import { collect, range, interleave } from '.';
import { asyncify } from './testIterators.fixture';
import * as test from 'tape';

test('interleave', async t => {
    const testCases: Array<[Array<number>, Array<Iterable<number>|AsyncIterable<number>>]> = [
        [
            [0, 1, 2, 3, 4],
            [range(5)]
        ],
        [
            [0, 1, 2, 3, 4],
            [asyncify(range(5))],
        ],
        [
            [0, 0, 1, 1, 2, 2, 3, 3, 4, 4],
            [range(5), asyncify(range(5))],
        ],
        [
            [0, 0, 1, 1, 2, 3, 4],
            [range(5), asyncify(range(2))],
        ],
    ];

    t.plan(testCases.length)

    for (const [expected, toInterleave] of testCases) {
        t.deepEqual(await collect(interleave(...toInterleave)), expected)
    }
})
