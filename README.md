# Async sequence operators

[![npm version](https://badge.fury.io/js/%40jsq%2Fseq.svg)](https://badge.fury.io/js/%40jsq%2Fseq)
[![minified gzipped size](https://badgen.net/bundlephobia/minzip/@jsq/seq)](https://bundlephobia.com/package/@jsq/seq)
[![Apache 2 License](https://img.shields.io/github/license/jeskew/seq.svg?style=flat)](https://opensource.org/licenses/Apache-2.0)

This package provides a number of functions for filtering, reducing, combining,
and otherwise transforming synchronous or asynchronous iterables. Where
possible, the functions in this library mirror those found on `Array.prototype`.
Unlike the methods on `Array.prototype`, all functions are evaluated lazily and
will only be applied to values as they are produced.

## Synchronous and asynchronous iteration

Functions that decorate a single iterator will return a synchronous iterable if
called with a synchronous iterable and an asynchronous iterable if called with
an asynchronous iterable. These functions may also be suffixed with `Sync` for
strictly synchronous usage:

```typescript
import { map, mapSync } from '@jsq/seq';

// Synchronous iterables can be decorated and still consumed synchronously
declare function syncSequence(): Iterable<number>;
const [first, second, third] = mapSync(x => x * x, syncSequence());

// Asynchronous iterables must be consumed asynchronously
declare function asyncSequence(): AsyncIterable<number>;
const squares = map(x => x * x, asyncSequence())[Symbol.asyncIterator]();
const { done, value } = await squares.next();

// When unsure, use a consumer that can handle both types of iterator
declare function anySequence(): Iterable<number>|AsyncIterable<number>;
for await (const squared of map(x => x * x, asyncSequence())) {
    // ...
}
```

Functions that operate on multiple iterables, such as `zip`, `merge`,
`interleave`, or `flatMap`, will always return asynchronous iterables.

Functions that reduce iterables to a single value, such as `sum`, `collect`, or
`reduce`, will always return a promise, though the provided iterator may be
consumed synchronously.

## Currying

All functions take an iterable as their last argument, which allows you to curry
and compose operators with `bind`:

```typescript
import { filter } from '@jsq/seq';

const evens = filter.bind(null, x => x % 2 === 0);
```

For documentation of the functions provided by this library, please see [the API
documentation](https://jeskew.github.io/seq/).
