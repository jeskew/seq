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

export function *throwOnIteration(): IterableIterator<never> {
    throw new Error('PANIC PANIC');
}
