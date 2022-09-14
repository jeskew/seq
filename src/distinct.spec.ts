import { collect, distinct, take } from './index.js';
import {
    asyncFibonacci,
    DECORATOR_ERROR_TEST_COUNT,
    testDecoratorErrorHandling,
} from './testIterators.fixture.js';
import test from 'tape';

test('distinct', async t => {
    t.plan(2 + DECORATOR_ERROR_TEST_COUNT)

    t.deepEqual(
        [1, 2, 3, 5],
        await collect(distinct([1, 1, 2, 3, 5]))
    )

    t.deepEqual(
        [1, 2, 3, 5],
        await collect(distinct(take(5, asyncFibonacci())))
    )

    await testDecoratorErrorHandling(distinct, t, 'distinct');
})
