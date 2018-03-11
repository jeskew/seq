import { every, range } from '.';
import {
    AsyncFibonacciSequence,
    asyncify,
    CloseHandlingIterator,
} from './testIterators.fixture';
import * as test from 'tape';

test('every', async t => {
    t.plan(6)

    const allEvens = every.bind(null, (num: number) => num % 2 === 0)

    t.equal(true, await allEvens(range(0, 10, 2)))

    t.equal(false, await allEvens(range(0, 10)))

    t.equal(true, await allEvens(asyncify(range(0, 10, 2))))

    t.equal(false, await allEvens(asyncify(range(0, 10))))

    const iter = new CloseHandlingIterator;
    await every(() => false, iter);
    t.ok(
        iter.returnCalled,
        '.return should be called on the underlying iterator when an element does not satisfy the predicate an early exit'
    );

    await every(() => false, new AsyncFibonacciSequence)
    t.pass('should handle early termination of iterators with no defined .return method')
})
