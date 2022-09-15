import { collect, range, interleave } from './index.js';
import { asyncify, CloseHandlingIterator, AsyncFibonacciSequence, LazyInitializingIterator } from './testIterators.fixture.js';
import test from 'tape';

test('interleave', async t => {
    const testCases: Array<[Array<number>, Array<Iterable<number>|AsyncIterable<number>>]> = [
        [
            [0, 1, 2, 3, 4],
            [range(5)]
        ],
        [
            [0, 1, 2, 3, 4],
            [asyncify(range(5))],
        ],
        [
            [0, 0, 1, 1, 2, 2, 3, 3, 4, 4],
            [range(5), asyncify(range(5))],
        ],
        [
            [0, 0, 1, 1, 2, 3, 4],
            [range(5), asyncify(range(2))],
        ],
    ];

    t.plan(testCases.length)

    for (const [expected, toInterleave] of testCases) {
        t.deepEqual(await collect(interleave(...toInterleave)), expected)
    }
})

test('interleave.return', async t => {
    t.plan(4)

    let returnTracking = [new CloseHandlingIterator, new CloseHandlingIterator]
    let count = 0
    for await (const _ of interleave(...returnTracking)) {
        if (count++ === returnTracking.length) break;
    }

    t.equal(
        true,
        returnTracking.every(iter => iter.returnCalled),
        'should communicate early termination to underlying iterators'
    )

    let fibs = [new AsyncFibonacciSequence, new AsyncFibonacciSequence]
    count = 0
    for await (const _ of interleave(...fibs)) {
        if (count++ === fibs.length) break;
    }

    t.pass('should handle early termination of iterators with no return method')

    let initTracking = [new LazyInitializingIterator, new LazyInitializingIterator]
    let decorated = interleave(...initTracking);

    t.equal(
        true,
        initTracking.every(iter => !iter.initialized),
        'should lazily initialize underlying iterators'
    );

    (decorated as any).return()
    t.equal(
        true,
        initTracking.every(iter => !iter.returnCalled),
        'should not call return on uninitialized underlying iterators'
    );
});
