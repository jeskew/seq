import { every, range } from './index.js';
import {
    AsyncFibonacciSequence,
    asyncify,
    CloseHandlingIterator,
} from './testIterators.fixture.js';
import test from 'tape';

test('every', async t => {
    t.plan(6)

    const acceptEvens = (num: number) => num % 2 === 0;

    t.equal(true, await every(acceptEvens, range(0, 10, 2)))

    t.equal(false, await every(acceptEvens, range(0, 10)))

    t.equal(true, await every(acceptEvens, asyncify(range(0, 10, 2))))

    t.equal(false, await every(acceptEvens, asyncify(range(0, 10))))

    const iter = new CloseHandlingIterator;
    await every(() => false, iter);
    t.ok(
        iter.returnCalled,
        '.return should be called on the underlying iterator when an element does not satisfy the predicate an early exit'
    );

    await every(() => false, new AsyncFibonacciSequence)
    t.pass('should handle early termination of iterators with no defined .return method')
})
