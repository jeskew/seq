import { range, tap } from '.';
import * as test from 'tape';

test('tap', async t => {
    t.plan(1)

    let count = 0;
    let tapTransducer = tap.bind(null, () => count++);
    for await (const _ of tapTransducer(range(5))) {}

    t.equal(count, 5)
})
