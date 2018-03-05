import { collect, range, zip } from '.';
import { asyncify } from './testIterators.fixture';
import * as test from 'tape';

test('zip', async t => {
    const testCases: Array<[
        Iterable<number>|AsyncIterable<number>,
        Iterable<number>|AsyncIterable<number>,
        Array<[number, number]>
    ]> = [
        [
            range(0, 100, 2),
            range(1, 10, 2),
            [[0, 1], [2, 3], [4, 5], [6, 7], [8, 9]],
        ],
        [
            asyncify(range(0, 100, 2)),
            range(1, 10, 2),
            [[0, 1], [2, 3], [4, 5], [6, 7], [8, 9]],
        ],
        [
            range(0, 100, 2),
            asyncify(range(1, 10, 2)),
            [[0, 1], [2, 3], [4, 5], [6, 7], [8, 9]],
        ],
        [
            asyncify(range(-1, -100, -2)),
            asyncify(range(1, 10, 2)),
            [[-1, 1], [-3, 3], [-5, 5], [-7, 7], [-9, 9]],
        ],
    ];

    t.plan(testCases.length)

    for (const [a, b, expected] of testCases) {
        t.deepEqual(
            await collect(zip(a, b)),
            expected,
            'should zip sync and async iterables together'
        )
    }
})
