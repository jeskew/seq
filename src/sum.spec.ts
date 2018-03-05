import { sum, range } from '.';
import { asyncify } from './testIterators.fixture';
import * as test from 'tape';

test('sum', async t => {
    t.plan(2)

    t.equal(
        await sum(range(10)),
        45,
        'should sum sync iterables'
    )

    t.equal(
        await sum(asyncify(range(10))),
        45,
        'should sum sync iterables'
    )
})
