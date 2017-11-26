# Async sequence operators

This package provides a number of functions for filtering, reducing, combining,
and otherwise transforming asynchronous iterators. Where possible, the functions
in this library mirror those found on `Array.prototype`. Unlike the methods on
`Array.prototype`, all functions are evaluated lazily and will only be applied
to values as they are produced.

All functions take an iterable as their last argument, which allows you to curry
and compose operators with `bind`:

```typescript
import {filter} from '@jsq/async-seq';

const evens = filter.bind(null, x => x % 2 === 0);
```

This library was designed with [the Pipeline Operator ECMAScript
proposal](https://github.com/tc39/proposal-pipeline-operator) (currently at
stage 1) in mind:

```typescript
import {filter, map, sum, takeWhile} from '@jsq/async-seq';

const infiniteRange = function *() {
    let i = 0;
    yield i++;
}

const sumOfAllEvenSquaresUnderTenMillion = infiniteRange()
    |> map.bind(null, x => x * x)
    |> filter.bind(null, x => x % 2 === 0)
    |> takeWhile.bind(null, x => x < 10000000)
    |> sum
    |> await;
```

For documentation of the functions provided by this library, please see the API
documentation.
