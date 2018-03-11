import { collect, filter, take } from '.';
import { asyncFibonacci, fibonacci, DECORATOR_ERROR_TEST_COUNT, testDecoratorErrorHandling } from './testIterators.fixture';
import * as test from 'tape';

const filterEvens = filter.bind(null, (num: number) => num % 2 === 0)

test('filter retains all elements that satisfy the predicate and discards the rest', async t => {
    t.plan(2)

    t.deepEqual(
        [2, 8, 34],
        await collect(filterEvens(take(10, fibonacci())))
    )

    t.deepEqual(
        [2, 8, 34],
        await collect(filterEvens(take(10, asyncFibonacci())))
    )
})

test('filter is applied lazily', async t => {
    t.plan(2)

    t.deepEqual(
        [2, 8, 34, 144, 610],
        await collect(take(5, filterEvens(fibonacci())))
    )

    t.deepEqual(
        [2, 8, 34, 144, 610],
        await collect(take(5, filterEvens(asyncFibonacci())))
    )
})

test('filter error handling', async t => {
    t.plan(DECORATOR_ERROR_TEST_COUNT)

    await testDecoratorErrorHandling(filter.bind(null, () => true), t, 'filter')
})
