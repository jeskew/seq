import { find, range } from '.';
import { asyncFibonacci } from './testIterators.fixture';
import * as test from 'tape';

test('find', async t => {
    t.plan(2)

    t.equal(
        144,
        await find((num: number) => num % 12 === 0, asyncFibonacci()),
        'finds elements in infinite sequences'
    )

    try {
        await find((num: number) => num > 100, range(5))
        t.fail('should have thrown when no sequence member satisfying the predicate could be found')
    } catch {
        t.pass('throws when no sequence members satisfy the predicate')
    }

})
