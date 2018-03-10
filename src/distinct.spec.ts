import { collect, distinct, take } from '.';
import {
    asyncFibonacci,
    CloseHandlingIterator,
    ExplosiveIterator,
} from './testIterators.fixture';
import * as test from 'tape';

test('distinct', async t => {
    t.plan(4)

    t.deepEqual(
        [1, 2, 3, 5],
        await collect(distinct([1, 1, 2, 3, 5]))
    )

    t.deepEqual(
        [1, 2, 3, 5],
        await collect(distinct(take(5, asyncFibonacci())))
    )

    try {
        await collect(distinct(new ExplosiveIterator))
    } catch (err) {
        t.equal(err.name, 'IterationDisallowedError');
    }

    const iter = new CloseHandlingIterator;
    try {
        await collect(distinct(iter))
    } catch {
        t.ok(iter.returnCalled)
    }
})
