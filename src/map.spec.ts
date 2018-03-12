import { collect, map, range } from '.';
import {
    asyncify,
    DECORATOR_ERROR_TEST_COUNT,
    testDecoratorErrorHandling,
} from './testIterators.fixture';
import * as test from 'tape';

test('map', async t => {
    const testCases: Array<[
        Iterable<number>|AsyncIterable<number>,
        (arg: number) => number|Promise<number>,
        Array<number>
    ]> = [
        [
            range(5),
            (x: number) => x * x,
            [0, 1, 4, 9, 16],
        ],
        [
            asyncify(range(5)),
            (x: number) => x * x,
            [0, 1, 4, 9, 16],
        ],
        [
            range(5),
            (x: number) => x * x,
            [0, 1, 4, 9, 16],
        ],
    ];

    t.plan(testCases.length + DECORATOR_ERROR_TEST_COUNT)

    for (const [iterable, predicate, expected] of testCases) {
        t.deepEqual(
            await collect(map(predicate, iterable)),
            expected
        )
    }

    testDecoratorErrorHandling(map.bind(null, (val: any) => val), t, 'map')
})
