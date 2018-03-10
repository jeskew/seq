export async function *asyncFibonacci() {
    yield* asyncify(fibonacci());
}

export async function *asyncify<T>(iterable: Iterable<T>) {
    for (const element of iterable) {
        yield element;
        await new Promise(resolve => {
            setTimeout(resolve, 0);
        });
    }
}

export function *fibonacci() {
    yield 1;

    for (let i = 1, j = 1; true; [i, j] = [j, i + j]) {
        yield j;
    }
}

export class IterationDisallowedError extends Error {
    name = 'IterationDisallowedError';
}

export class ExplosiveIterator {
    [Symbol.asyncIterator]() {
        return this;
    }

    next(): Promise<IteratorResult<void>> {
        return Promise.reject(new IterationDisallowedError('PANIC'));
    }
}

export class CloseHandlingIterator extends ExplosiveIterator {
    returnCalled = false;

    return(): Promise<IteratorResult<void>> {
        this.returnCalled = true;
        return Promise.resolve({done: true} as IteratorResult<void>);
    }
}
