import { Test } from 'tape';

/**
 * @internal
 */
export async function *asyncFibonacci() {
    yield* new AsyncFibonacciSequence
}

/**
 * @internal
 */
export async function *asyncify<T>(iterable: Iterable<T>) {
    for (const element of iterable) {
        yield element;
        await new Promise(resolve => {
            setTimeout(resolve, 0);
        });
    }
}

/**
 * @internal
 */
export class FibonacciSequence {
    private a = 1;
    private b = 1;

    [Symbol.iterator]() {
        return this;
    }

    next(): IteratorResult<number> {
        const value = this.a;
        [this.a, this.b] = [this.b, this.a + this.b];
        return { done: false, value }
    }
}

/**
 * @internal
 */
export class AsyncFibonacciSequence {
    private readonly seq = new FibonacciSequence;

    [Symbol.asyncIterator]() {
        return this;
    }

    next(): Promise<IteratorResult<number>> {
        const next = this.seq.next();
        return new Promise(resolve => {
            setTimeout(() => resolve(next), 0);
        })
    }
}

/**
 * @internal
 */
export function *fibonacci(): IterableIterator<number> {
    yield* new FibonacciSequence;
}

const IterationDisallowedErrorName = 'IterationDisallowedError';

class IterationDisallowedError extends Error {
    name = IterationDisallowedErrorName;
}

/**
 * @internal
 */
export class ExplosiveIterator {
    [Symbol.asyncIterator]() {
        return this;
    }

    next(): Promise<IteratorResult<void>> {
        return Promise.reject(new IterationDisallowedError('PANIC'));
    }
}

/**
 * @internal
 */
export class CloseHandlingIterator {
    returnCalled = false;

    [Symbol.asyncIterator]() {
        return this;
    }

    next(): Promise<IteratorResult<void>> {
        return Promise.resolve({done: false} as IteratorResult<void>);
    }

    return(): Promise<IteratorResult<void>> {
        this.returnCalled = true;
        return Promise.resolve({done: true} as IteratorResult<void>);
    }
}

/**
 * @internal
 */
class ExplosiveCloseHandlingIterator extends CloseHandlingIterator {
    next(): Promise<IteratorResult<void>> {
        return Promise.reject(new IterationDisallowedError('PANIC'));
    }
}

/**
 * @internal
 */
export class LazyInitializingIterator extends CloseHandlingIterator {
    initialized = false;

    [Symbol.asyncIterator]() {
        this.initialized = true;
        return this;
    }
}

/**
 * @internal
 */
export const DECORATOR_ERROR_TEST_COUNT = 3;

/**
 * @internal
 */
export async function testDecoratorErrorHandling(
    decorator: (iterable: Iterable<any>|AsyncIterable<any>) => Iterable<any>|AsyncIterable<any>,
    testRunner: Test,
    name: string
): Promise<void> {
    try {
        for await (const _ of decorator(new AsyncFibonacciSequence)) {
            throw new Error('PANIC');
        }
    } catch {
        testRunner.pass(
            `${name} should allow aborting iteration of iterators with no defined return method`
        );
    }

    const iter = new CloseHandlingIterator;
    try {
        for await (const _ of decorator(iter)) {
            throw new Error('PANIC');
        }
    } catch {
        testRunner.ok(
            iter.returnCalled,
            `${name} should call .return on the underlying iterator when iteration is aborted`
        );
    }

    const errorIter = new ExplosiveCloseHandlingIterator;
    try {
        for await (const _ of decorator(errorIter)) {}
    } catch (err) {
        testRunner.ok(
            iter.returnCalled,
            `${name} should call .return on the underlying iterator when iteration triggers an error`
        );
    }
}
