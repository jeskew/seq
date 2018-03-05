import { every, range } from '.';
import { asyncify } from './testIterators.fixture';
import * as test from 'tape';

test('every', async t => {
    t.plan(4)

    const allEvens = every.bind(null, (num: number) => num % 2 === 0)

    t.equal(true, await allEvens(range(0, 10, 2)))

    t.equal(false, await allEvens(range(0, 10)))

    t.equal(true, await allEvens(asyncify(range(0, 10, 2))))

    t.equal(false, await allEvens(asyncify(range(0, 10))))
})
