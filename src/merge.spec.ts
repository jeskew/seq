import { collect, merge } from '.';
import * as test from 'tape';

test('merge', async t => {
    t.plan(2)

    t.deepEqual(
        await collect(merge(
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
            [0]
        )),
        [0, 1, 2, 3, 4, 5],
        'should yield elements in the order in which they become available'
    );

    t.deepEqual(
        await collect(merge(
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
        )),
        [0, 1, 2, 3],
        'should prioritize elements yielded by iterables provided first in the arguments'
    )
})
