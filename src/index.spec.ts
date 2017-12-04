import {
    collect,
    concat,
    distinct,
    every,
    filter,
    find,
    flatMap,
    flatten,
    includes,
    interleave,
    map,
    merge,
    range,
    RecursiveIterable,
    reduce,
    repeat,
    skip,
    some,
    sum,
    SyncOrAsyncIterable,
    take,
    takeWhile,
    tap,
    zip,
} from './index';
import {
    AsyncTest,
    Expect,
    Test,
    TestCase,
    TestFixture,
} from 'alsatian';

@TestFixture('Tests that exercise sequence functions using standard inputs')
export class FunctionalTests {

    @TestCase(
        range(5),
        [0, 1, 2, 3, 4]
    )
    @TestCase(
        asyncify(range(5)),
        [0, 1, 2, 3, 4]
    )
    @AsyncTest('Basic test cases for `collect`')
    async collect<T>(
        iterable: SyncOrAsyncIterable<T>,
        expected: Array<T>
    ) {
        Expect(await collect(iterable)).toEqual(expected);
    }

    @TestCase(
        [
            range(5),
            asyncify(range(5, 10)),
            range(10, 15),
            asyncify(range(15, 20)),
        ],
        [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19]
    )
    @AsyncTest('Basic test cases for `concat`')
    async concat<T>(
        iterables: Array<SyncOrAsyncIterable<T>>,
        expected: Array<T>
    ) {
        Expect(await collect(concat.apply(null, iterables))).toEqual(expected);
    }

    @TestCase(
        [1, 1, 2, 3, 5],
        [1, 2, 3, 5]
    )
    @TestCase(
        asyncify([1, 1, 2, 3, 5]),
        [1, 2, 3, 5]
    )
    @AsyncTest('Basic test cases for `distinct`')
    async distinct<T>(
        iterable: SyncOrAsyncIterable<T>,
        expected: Array<T>
    ) {
        Expect(await collect(distinct(iterable))).toEqual(expected);
    }

    @TestCase(
        range(0, 10, 2),
        (num: number) => num % 2 === 0,
        true
    )
    @TestCase(
        range(0, 10),
        (num: number) => num % 2 === 0,
        false
    )
    @TestCase(
        asyncify(range(0, 10, 2)),
        (num: number) => num % 2 === 0,
        true
    )
    @TestCase(
        asyncify(range(0, 10)),
        (num: number) => num % 2 === 0,
        false
    )
    @AsyncTest('Basic test cases for `every`')
    async every<T>(
        iterable: SyncOrAsyncIterable<T>,
        predicate: (arg: T) => boolean,
        expected: boolean
    ) {
        Expect(await every(predicate, iterable)).toBe(expected);
    }

    @TestCase(
        range(10),
        (num: number) => num % 2 === 0,
        [0, 2, 4, 6, 8]
    )
    @TestCase(
        range(10),
        (num: number) => num % 2 !== 0,
        [1, 3, 5, 7, 9]
    )
    @TestCase(
        asyncify(range(10)),
        (num: number) => num % 2 === 0,
        [0, 2, 4, 6, 8]
    )
    @TestCase(
        asyncify(range(10)),
        (num: number) => num % 2 !== 0,
        [1, 3, 5, 7, 9]
    )
    @AsyncTest('Basic test cases for `filter`')
    async filter<T>(
        iterable: SyncOrAsyncIterable<T>,
        predicate: (arg: T) => boolean,
        expected: Array<T>
    ) {
        Expect(await collect(filter(predicate, iterable))).toEqual(expected);
    }

    @TestCase(
        range(3, Infinity, 3),
        (num: number) => num % 5 === 0,
        15
    )
    @TestCase(
        range(5),
        (num: number) => num > 100
    )
    @TestCase(
        range(5),
        (num: number) => Promise.resolve(num > 100)
    )
    @AsyncTest('Basic test cases for `find`')
    async find<T>(
        iterable: SyncOrAsyncIterable<T>,
        predicate: (arg: T) => boolean|Promise<boolean>,
        expected?: T
    ) {
        if (expected === undefined) {
            let expectedErrorEncountered = false;
            try {
                await find(predicate, iterable);
            } catch (_) {
                expectedErrorEncountered = true;
            }

            Expect(expectedErrorEncountered).toBe(true);
        } else {
            Expect(await find(predicate, iterable)).toEqual(expected);
        }
    }

    @TestCase(
        range(5),
        (num: number) => num % 2 === 0 ? range(num + 1) : asyncify(range(num + 1)),
        [0, 0, 1, 0, 1, 2, 0, 1, 2, 3, 0, 1, 2, 3, 4]
    )
    @TestCase(
        range(5),
        (num: number) => num % 2 === 0 ? range(num + 1) : num,
        [0, 1, 0, 1, 2, 3, 0, 1, 2, 3, 4]
    )
    @TestCase(
        range(5),
        (num: number) => num % 2 === 0 ? num : asyncify(range(num + 1)),
        [0, 0, 1, 2, 0, 1, 2, 3, 4]
    )
    @AsyncTest('Basic test cases for `flatMap`')
    async flatMap<T, R>(
        iterable: SyncOrAsyncIterable<T>,
        predicate: (arg: T) => R|Promise<R>|SyncOrAsyncIterable<R>,
        expected: Array<R>
    ) {
        Expect(await collect(flatMap(predicate, iterable))).toEqual(expected);
    }

    @TestCase(
        [0, 1, 2, 3],
        [[0], [1, 2], 3]
    )
    @TestCase(
        [[0], [1, 2], 3],
        [[0], [1, 2], 3],
        0
    )
    @TestCase(
        [[0], 1, 2, 3],
        [[[[[[[0]]]]]], [1, 2], 3],
        5
    )
    @TestCase(
        ['an', 'iterable', 'of', 'strings'],
        [[[[[[[[[[['an']]]]]]]]]], ['iterable', 'of'], 'strings'],
        Infinity
    )
    @AsyncTest('Basic test cases for `flatten`')
    async flatten<T>(
        expected: Array<T>,
        iterable: RecursiveIterable<T>,
        depth?: number
    ) {
        const flattened = depth !== undefined
            ? flatten(depth, iterable)
            : flatten(iterable);

        Expect(await collect(flattened)).toEqual(expected);
    }

    @TestCase(
        range(0, 10, 2),
        5,
        false
    )
    @TestCase(
        range(0, 10),
        5,
        true
    )
    @TestCase(
        asyncify(range(0, 10, 2)),
        5,
        false
    )
    @TestCase(
        asyncify(range(0, 10)),
        5,
        true
    )
    @AsyncTest('Basic test cases for `every`')
    async includes<T>(
        iterable: SyncOrAsyncIterable<T>,
        searchElement: T,
        expected: boolean
    ) {
        Expect(await includes(searchElement, iterable)).toBe(expected);
    }

    @TestCase(
        [0, 1, 2, 3, 4],
        range(5)
    )
    @TestCase(
        [0, 1, 2, 3, 4],
        asyncify(range(5))
    )
    @TestCase(
        [0, 0, 1, 1, 2, 2, 3, 3, 4, 4],
        range(5),
        asyncify(range(5))
    )
    @TestCase(
        [0, 0, 1, 1, 2, 3, 4],
        range(5),
        asyncify(range(2))
    )
    @AsyncTest('Basic test cases for `interleave`')
    async interleave<T>(
        expected: Array<T>,
        ...iterables: Array<SyncOrAsyncIterable<T>>
    ) {
        Expect(await collect(interleave(...iterables))).toEqual(expected);
    }

    @TestCase(
        range(5),
        (x: number) => x * x,
        [0, 1, 4, 9, 16]
    )
    @TestCase(
        asyncify(range(5)),
        (x: number) => x * x,
        [0, 1, 4, 9, 16]
    )
    @TestCase(
        range(5),
        (x: number) => Promise.resolve(x * x),
        [0, 1, 4, 9, 16]
    )
    @AsyncTest('Basic test cases for `map`')
    async map<T, R>(
        iterable: SyncOrAsyncIterable<T>,
        f: (arg: T) => R|Promise<R>,
        expected: Array<R>
    ) {
        Expect(await collect(map(f, iterable))).toEqual(expected);
    }

    @TestCase(
        [0, 1, 2, 3, 4, 5],
        async function *() {
            await new Promise(resolve => setTimeout(resolve, 10));
            yield 1;
        }(),
        async function *() {
            await new Promise(resolve => setTimeout(resolve, 50));
            yield 5;
        }(),
        async function *() {
            await new Promise(resolve => setTimeout(resolve, 40));
            yield 4;
        }(),
        async function *() {
            await new Promise(resolve => setTimeout(resolve, 20));
            yield 2;
        }(),
        async function *() {
            await new Promise(resolve => setTimeout(resolve, 30));
            yield 3;
        }(),
        [0],
    )
    @TestCase(
        [0, 1, 2, 3],
        async function *() {
            yield 0;
            await new Promise(resolve => setTimeout(resolve, 10));
            yield 2;
        }(),
        async function *() {
            yield 1;
            await new Promise(resolve => setTimeout(resolve, 10));
            yield 3;
        }()
    )
    @AsyncTest('Basic test cases for `merge`')
    async merge<T>(
        expected: Array<T>,
        ...iterables: Array<SyncOrAsyncIterable<T>>
    ) {
        Expect(await collect(merge(...iterables))).toEqual(expected);
    }

    @TestCase(
        [10],
        [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
    )
    @TestCase(
        [5, 10],
        [5, 6, 7, 8, 9]
    )
    @TestCase(
        [0, 20, 3],
        [0, 3, 6, 9, 12, 15, 18]
    )
    @TestCase(
        [10, 0, -1],
        [10, 9, 8, 7, 6, 5, 4, 3, 2, 1]
    )
    @Test('Basic test cases for `range`')
    range(
        args: [number]|[number, number]|[number, number, number],
        expected: Array<number>
    ) {
        Expect([...range.apply(null, args)]).toEqual(expected);
    }

    @TestCase(
        (carry: string, value: number) => carry + value.toString(16),
        'HEX: ',
        range(16),
        'HEX: 0123456789abcdef'
    )
    @TestCase(
        (carry: string, value: number) => carry + value.toString(16),
        'HEX: ',
        asyncify(range(16)),
        'HEX: 0123456789abcdef'
    )
    @AsyncTest('Calling reduce with an initial value')
    async reduceWithInitialValue<T, R>(
        reducer: (accumulator: R, currentValue: T) => R,
        initialValue: R,
        iterable: SyncOrAsyncIterable<T>,
        expected: R
    ) {
        Expect(await reduce(reducer, initialValue, iterable)).toEqual(expected);
    }

    @TestCase(
        (carry: number, value: number) => carry * value,
        range(1, 10),
        362880
    )
    @TestCase(
        (carry: number, value: number) => carry * value,
        asyncify(range(1, 10)),
        362880
    )
    @AsyncTest('Calling reduce with an initial value')
    async reduceWithoutInitialValue<T>(
        reducer: (accumulator: T, currentValue: T) => T,
        iterable: SyncOrAsyncIterable<T>,
        expected: T
    ) {
        Expect(await reduce(reducer, iterable)).toEqual(expected);
    }

    @TestCase(
        10,
        range(11),
        [10]
    )
    @TestCase(
        10,
        asyncify(range(11)),
        [10]
    )
    @TestCase(
        0,
        range(5),
        [0, 1, 2, 3, 4]
    )
    @TestCase(
        0,
        asyncify(range(5)),
        [0, 1, 2, 3, 4]
    )
    @AsyncTest('Basic test cases for `skip`')
    async skip<T>(
        toSkip: number,
        iterable: SyncOrAsyncIterable<T>,
        expected: Array<T>
    ) {
        Expect(await collect(skip(toSkip, iterable))).toEqual(expected);
    }

    @TestCase(
        range(1, 10),
        (num: number) => num % 2 === 0,
        true
    )
    @TestCase(
        range(1, 10, 2),
        (num: number) => num % 2 === 0,
        false
    )
    @TestCase(
        asyncify(range(1, 10)),
        (num: number) => num % 2 === 0,
        true
    )
    @TestCase(
        asyncify(range(1, 10, 2)),
        (num: number) => num % 2 === 0,
        false
    )
    @AsyncTest('Basic test cases for `some`')
    async some<T>(
        iterable: SyncOrAsyncIterable<T>,
        predicate: (arg: T) => boolean,
        expected: boolean
    ) {
        Expect(await some(predicate, iterable)).toBe(expected);
    }

    @TestCase(
        range(10),
        45
    )
    @TestCase(
        asyncify(range(10)),
        45
    )
    @AsyncTest('Basic test cases for `sum`')
    async sum(
        iterable: Iterable<number>|AsyncIterable<number>,
        expected: number
    ) {
        Expect(await sum(iterable)).toBe(expected);
    }

    @TestCase(10, repeat('foo'))
    @TestCase(10, asyncify(repeat('foo')))
    @TestCase(10, range(5))
    @TestCase(10, asyncify(range(5)))
    @TestCase(0, throwOnIteration())
    @AsyncTest('Basic test cases for `take`')
    async take<T>(
        limit: number,
        iterable: SyncOrAsyncIterable<T>
    ) {
        Expect((await collect(take(limit, iterable))).length)
            .toBeLessThan(limit + 1);
    }

    @TestCase(
        range(10),
        (arg: number) => arg < 5,
        [0, 1, 2, 3, 4]
    )
    @TestCase(
        fibonacci(),
        (arg: number) => arg < 100,
        [1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89]
    )
    @AsyncTest('Basic test cases for `takeWhile`')
    async takeWhile<T>(
        iterable: SyncOrAsyncIterable<T>,
        predicate: (arg: T) => boolean,
        expected: Array<T>
    ) {
        Expect(await collect(takeWhile(predicate, iterable))).toEqual(expected);
    }

    @AsyncTest('Basic test case for `tap`')
    async tap() {
        let count = 0;
        let tapTransducer = tap.bind(null, () => count++);
        for await (const _ of tapTransducer(range(5))) {}

        Expect(count).toBe(5);
    }

    @TestCase(
        range(0, 100, 2),
        range(1, 10, 2),
        [[0, 1], [2, 3], [4, 5], [6, 7], [8, 9]]
    )
    @TestCase(
        asyncify(range(0, 100, 2)),
        range(1, 10, 2),
        [[0, 1], [2, 3], [4, 5], [6, 7], [8, 9]]
    )
    @TestCase(
        range(0, 100, 2),
        asyncify(range(1, 10, 2)),
        [[0, 1], [2, 3], [4, 5], [6, 7], [8, 9]]
    )
    @TestCase(
        asyncify(range(0, 100, 2)),
        asyncify(range(1, 10, 2)),
        [[0, 1], [2, 3], [4, 5], [6, 7], [8, 9]]
    )
    @AsyncTest('Basic test cases for `zip`')
    async zip<K, V>(
        keys: Iterable<K>|AsyncIterable<K>,
        values: Iterable<V>|AsyncIterable<V>,
        expected: Array<[K, V]>
    ) {
        Expect(await collect(zip(keys, values))).toEqual(expected);
    }
}

async function *asyncify<T>(iterable: Iterable<T>) {
    for (const element of iterable) {
        yield element;
        await new Promise(resolve => {
            setTimeout(resolve, 0);
        });
    }
}

function *fibonacci() {
    yield 1;

    for (let i = 1, j = 1; true; [i, j] = [j, i + j]) {
        yield j;
    }
}

function *throwOnIteration(): IterableIterator<never> {
    throw new Error('PANIC PANIC');
}
