import { collect, range, skip } from './index.js';
import {
    asyncify,
    DECORATOR_ERROR_TEST_COUNT,
    testDecoratorErrorHandling,
} from './testIterators.fixture.js';
import test from 'tape';

test('skip', async t => {
    const testCases: Array<[
        number,
        Iterable<number>|AsyncIterable<number>,
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

    t.plan(testCases.length + DECORATOR_ERROR_TEST_COUNT);

    for (const [toSkip, iterable, expected] of testCases) {
        t.deepEqual(await collect(skip(toSkip, iterable)), expected)
    }

    await testDecoratorErrorHandling(skip.bind(null, 10), t, 'skip');
})
