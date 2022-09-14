import { collect, flatten } from './index.js';
import {
    asyncify,
    DECORATOR_ERROR_TEST_COUNT,
    testDecoratorErrorHandling
} from './testIterators.fixture.js';
import test from 'tape';

test('flatten', async t => {
    t.plan(4 + DECORATOR_ERROR_TEST_COUNT)

    t.deepEqual(
        await collect(flatten(asyncify([[0], [1, 2], 3]))),
        [0, 1, 2, 3],
        'flattens async iterables'
    )

    t.deepEqual(
        await collect(flatten(5, [[[[[[[0]]]]]], [1, 2], 3])),
        [[0], 1, 2, 3],
        'flattens to a specified depth'
    )

    t.deepEqual(
        await collect(flatten(
            Infinity,
            [[[[[[[[[[['an']]]]]]]]]], ['iterable', 'of'], 'strings']
        )),
        ['an', 'iterable', 'of', 'strings'],
        'does not flatten strings'
    )

    t.deepEqual(
        await collect(flatten(Infinity, [{foo: 'bar'}])),
        [{foo: 'bar'}],
        'should yield uniterable objects'
    )

    await testDecoratorErrorHandling(flatten, t, 'flatten')
})
