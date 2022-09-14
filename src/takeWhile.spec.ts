import { collect, takeWhile, range } from './index.js';
import { asyncFibonacci, DECORATOR_ERROR_TEST_COUNT, testDecoratorErrorHandling, asyncify } from './testIterators.fixture.js';
import test from 'tape';

test('takeWhile', async t => {
    t.plan(3)

    t.deepEqual(
        [...takeWhile((arg: number) => arg < 5, range(10))],
        [0, 1, 2, 3, 4],
        'should limit iteration of sync iterables'
    )

    t.deepEqual(
        await collect(takeWhile((arg: number) => arg < 100, asyncFibonacci())),
        [1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89],
        'should limit iteration of async iterables'
    )

    const iter = (takeWhile(() => false, asyncify([0])) as any)[Symbol.asyncIterator]()
    await iter.next();
    t.ok(
        (await iter.next()).done,
        'should handle .next being called after iteration finishes'
    );
})

test('takeWhile error handling', async t => {
    t.plan(DECORATOR_ERROR_TEST_COUNT);

    await testDecoratorErrorHandling(takeWhile.bind(null, () => true), t, 'takeWhile')
});
