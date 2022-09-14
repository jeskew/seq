import { collect, filter, take } from './index.js';
import { asyncFibonacci, fibonacci, DECORATOR_ERROR_TEST_COUNT, testDecoratorErrorHandling } from './testIterators.fixture.js';
import test from 'tape';

const acceptEvens = (num: number) => num % 2 === 0;

test('filter retains all elements that satisfy the predicate and discards the rest', async t => {
    t.plan(2)

    t.deepEqual(
        [2, 8, 34],
        [...filter(acceptEvens, take(10, fibonacci()))]
    )

    t.deepEqual(
        [2, 8, 34],
        await collect(filter(acceptEvens, take(10, asyncFibonacci())))
    )
})

test('filter is applied lazily', async t => {
    t.plan(2)

    t.deepEqual(
        [2, 8, 34, 144, 610],
        [...take(5, filter(acceptEvens, fibonacci()) as IterableIterator<number>)]
    )

    t.deepEqual(
        [2, 8, 34, 144, 610],
        await collect(take(5, filter(acceptEvens, asyncFibonacci())))
    )
})

test('filter error handling', async t => {
    t.plan(DECORATOR_ERROR_TEST_COUNT)

    await testDecoratorErrorHandling(filter.bind(null, () => true), t, 'filter')
})
