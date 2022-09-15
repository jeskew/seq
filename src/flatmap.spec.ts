import { collect, flatMap, range } from './index.js';
import { asyncify } from './testIterators.fixture.js';
import test from 'tape';

test('flatmap', async t => {
    t.plan(1)

    t.deepEqual(
        await collect(flatMap(
            (num: number) => num % 2 === 0
                ? range(num + 1)
                : asyncify(range(num + 1)),
            range(5)
        )),
        [0, 0, 1, 0, 1, 2, 0, 1, 2, 3, 0, 1, 2, 3, 4]
    )
})
