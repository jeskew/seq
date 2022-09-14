import { range, reduce } from './index.js';
import { asyncify } from './testIterators.fixture.js';
import test from 'tape';

test('reduce with an initial value', async t => {
    const testCases: Array<[
        (carry: string, value: number) => string,
        string,
        Iterable<number>|AsyncIterable<number>,
        string
    ]> = [
        [
            (carry: string, value: number) => carry + value.toString(16),
            'HEX: ',
            range(16),
            'HEX: 0123456789abcdef',
        ],
        [
            (carry: string, value: number) => carry + value.toString(16),
            'HEX: ',
            asyncify(range(16)),
            'HEX: 0123456789abcdef',
        ],
    ];

    t.plan(testCases.length)

    for (const [reducer, initialValue, iterable, expected] of testCases) {
        t.deepEqual(
            await reduce(reducer, initialValue, iterable),
            expected
        )
    }
});

test('reduce without an initial value', async t => {
    const testCases: Array<[
        (carry: number, value: number) => number,
        Iterable<number>|AsyncIterable<number>,
        number
    ]> = [
        [
            (carry: number, value: number) => carry * value,
            range(1, 10),
            362880,
        ],
        [
            (carry: number, value: number) => carry * value,
            asyncify(range(1, 10)),
            362880,
        ],
    ];

    t.plan(testCases.length)

    for (const [reducer, iterable, expected] of testCases) {
        t.deepEqual(
            await reduce(reducer, iterable),
            expected
        )
    }
});
