import { find, range } from '.';
import {
    AsyncFibonacciSequence,
    asyncify,
    CloseHandlingIterator,
    fibonacci,
} from './testIterators.fixture';
import * as test from 'tape';

test('find', async t => {
    t.plan(5)

    t.equal(
        144,
        await find((num: number) => num % 12 === 0, fibonacci()),
        'finds elements in infinite sequences'
    )

    t.equal(
        144,
        await find((num: number) => num % 12 === 0, new AsyncFibonacciSequence()),
        'finds elements in infinite async sequences'
    )

    const iter = new CloseHandlingIterator
    await find(() => true, iter);
    t.ok(
        iter.returnCalled,
        'calls .return on the underlying iterator when a match is found'
    )

    try {
        await find((num: number) => num > 100, range(5))
    } catch {
        t.pass('throws when no sequence members satisfy the predicate')
    }

    try {
        await find((num: number) => num > 100, asyncify(range(5)))
    } catch {
        t.pass('throws when no async sequence members satisfy the predicate')
    }
})
