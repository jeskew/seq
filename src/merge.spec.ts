import { collect, merge } from './index.js';
import {
    DECORATOR_ERROR_TEST_COUNT,
    testDecoratorErrorHandling,
} from './testIterators.fixture.js';
import test from 'tape';

test('merge', async t => {
    t.plan(3 + DECORATOR_ERROR_TEST_COUNT)

    t.deepEqual(
        await collect(merge(
            [0, 4, 7, 9],
            [1, 5, 8],
            [2, 6],
            [3],
        )),
        [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
        'should yield from synchronous iterators in the order in which they were received'
    )

    t.deepEqual(
        await collect(merge(
            async function *() {
                await new Promise(resolve => setTimeout(resolve, 10));
                yield 1;
            }(),
            async function *() {
                await new Promise(resolve => setTimeout(resolve, 50));
                yield 5;
            }(),
            async function *() {
                await new Promise(resolve => setTimeout(resolve, 40));
                yield 4;
            }(),
            async function *() {
                await new Promise(resolve => setTimeout(resolve, 20));
                yield 2;
            }(),
            async function *() {
                await new Promise(resolve => setTimeout(resolve, 30));
                yield 3;
            }(),
            [0]
        )),
        [0, 1, 2, 3, 4, 5],
        'should yield elements in the order in which they become available'
    );

    t.deepEqual(
        await collect(merge(
            async function *() {
                yield 0;
                await new Promise(resolve => setTimeout(resolve, 10));
                yield 2;
            }(),
            async function *() {
                yield 1;
                await new Promise(resolve => setTimeout(resolve, 10));
                yield 3;
            }()
        )),
        [0, 1, 2, 3],
        'should prioritize elements yielded by iterables provided first in the arguments'
    );

    await testDecoratorErrorHandling(merge, t, 'merge');
})
