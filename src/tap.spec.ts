import { range, tap } from '.';
import * as test from 'tape';
import { DECORATOR_ERROR_TEST_COUNT, testDecoratorErrorHandling } from './testIterators.fixture';

test('tap', async t => {
    t.plan(1)

    let count = 0;
    let tapTransducer = tap.bind(null, () => { count++; });
    for await (const _ of tapTransducer(range(5))) {}

    t.equal(count, 5)
});

test('tap error handling', async t => {
    t.plan(DECORATOR_ERROR_TEST_COUNT);

    testDecoratorErrorHandling(tap.bind(null, async () => {}), t, 'tap');
});
