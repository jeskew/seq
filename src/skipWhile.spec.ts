import { collect, skipWhile } from './index.js';
import {
    asyncify,
    DECORATOR_ERROR_TEST_COUNT,
    testDecoratorErrorHandling,
} from './testIterators.fixture.js';
import test from 'tape';

test('skipWhile', async t => {
    const testCases: Array<[
        (arg: number) => boolean,
        Iterable<number>|AsyncIterable<number>,
        Array<number>
    ]> = [
        [
            (arg: number) => arg < 10,
            [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 9],
            [10, 9],
        ],
        [
            (arg: number) => arg < 10,
            asyncify([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 9]),
            [10, 9],
        ],
    ];

    t.plan(testCases.length + DECORATOR_ERROR_TEST_COUNT)

    for (const [predicate, iterable, expected] of testCases) {
        t.deepEqual(await collect(skipWhile(predicate, iterable)), expected)
    }

    await testDecoratorErrorHandling(skipWhile.bind(null, () => false), t, 'skipWhile');
})
