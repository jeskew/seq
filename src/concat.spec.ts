import { collect, concat, skip, take } from '.';
import { asyncFibonacci, fibonacci } from './testIterators.fixture';
import * as test from 'tape';

test('concat', async t => {
    t.plan(1)

    t.deepEqual(
        [1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144],
        await collect(concat(
            take(3, fibonacci()),
            take(3, skip(3, asyncFibonacci())),
            take(3, skip(6, fibonacci())),
            take(3, skip(9, asyncFibonacci())),
        ))
    )
})
