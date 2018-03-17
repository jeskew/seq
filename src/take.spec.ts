import { range, repeat, take } from '.';
import {
    asyncify,
    DECORATOR_ERROR_TEST_COUNT,
    ExplosiveIterator,
    testDecoratorErrorHandling,
} from './testIterators.fixture';
import * as test from 'tape';

test('take', async t => {
    const testCases: Array<[number, Iterable<any>|AsyncIterable<any>]> = [
        [10, repeat('foo')],
        [10, asyncify(repeat('foo'))],
        [10, range(5)],
        [10, asyncify(range(5))],
        [0, new ExplosiveIterator()],
        [
            0,
            (function *(): IterableIterator<never> {
                throw new Error('PANIC');
            })(),
        ],
    ];

    t.plan(testCases.length);

    take(2, [1, 2, 3]);

    for (const [limit, iterable] of testCases) {
        let count = 0
        for await (const _ of take(limit, iterable)) {
            count++
        }

        t.assert(
            count <= limit,
            `should fetch at most ${limit} elements from the source iterable`
        );
    }
})

test('take error handling', async t => {

    t.plan(DECORATOR_ERROR_TEST_COUNT);

    testDecoratorErrorHandling(take.bind(null, 5), t, 'take');
});
