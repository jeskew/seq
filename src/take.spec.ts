import { range, repeat, take } from '.';
import { asyncify, ExplosiveIterator } from './testIterators.fixture';
import * as test from 'tape';

test('take', async t => {
    const testCases: Array<[number, Iterable<any>|AsyncIterable<any>]> = [
        [10, repeat('foo')],
        [10, asyncify(repeat('foo'))],
        [10, range(5)],
        [10, asyncify(range(5))],
        [0, new ExplosiveIterator()],
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
