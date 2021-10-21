import assert from 'assert';
import { interpret } from 'xstate/lib/interpreter';
import foo from './bar.js';
class TesterantoTestSuite {
    constructor(assertioner) {
        this.mapStore = new Map();
        this.assertioner = assertioner;
    }
    on(k, v) {
        if (this.mapStore.get(k)) {
            throw new Error('no!');
        }
        this.mapStore.set(k, v);
        return this;
    }
    getTestRuns(steps = []) {
        return [
            { steps, assertioner: this.assertioner },
            ...Object.keys(Object.fromEntries(this.mapStore)).map((step) => {
                return this.mapStore.get(step).getTestRuns([...steps, step]);
            }),
        ].flat(1);
    }
}
const is = (x) => new TesterantoTestSuite(x);
const root = is((state) => assert.deepEqual(state.value, 'green'))
    .on('TICK', is((state) => assert.deepEqual(state.context.tick, 2)).on('TICK', is((state) => assert.deepEqual(state.context.tick, 1))));
// .on(
//   'POWER_OUTAGE',
//   is((state) => assert.deepEqual(state.value, { red: 'walk' })).on(
//     'TIMER',
//     is((state) => assert.deepEqual(state.value, { red: 'wait' }))
//   )
// )
// .on(
//   'TIMER',
//   is((state) => assert.deepEqual(state.value, 'yellow')).on(
//     'TIMER',
//     is((state) => assert.deepEqual(state.value, { red: 'walk' })).on(
//       'TIMER',
//       is((state) => assert.deepEqual(state.value, { red: 'wait' })).on(
//         'TIMER',
//         is((state) => assert.deepEqual(state.value, 'green')).on(
//           'TIMER',
//           is((state) => assert.deepEqual(state.value, 'yellow'))
//         )
//       )
//     )
//   )
// );
root.getTestRuns().forEach((run) => {
    // console.log(run);
    const promiseService = interpret(foo.lightMachine)
        .onTransition((e) => {
        console.log('onTransition');
    })
        .onChange((e) => {
        console.log('onChange', e);
    })
        .onEvent((e) => {
        console.log('onEvent', e);
    }).start();
    let s;
    run.steps.forEach((step) => {
        s = promiseService.send({ type: step });
        // console.log(s.value, s.context);
        // foo.lightMachine.transition()
    });
    run.assertioner(promiseService.getSnapshot());
    // .forEach((assertion) => {
    //   assert.deepEqual(promiseService.getSnapshot().value, assertion, JSON.stringify(run));
    // });
});
export default {};
