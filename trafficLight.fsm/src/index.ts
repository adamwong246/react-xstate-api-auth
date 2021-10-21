import assert from 'assert';
import { isConstructorDeclaration } from 'typescript';
import { State } from 'xstate';
import { interpret } from 'xstate/lib/interpreter';

import { createTrafficLightMachine } from './machine';

// a tree data structure which maps a sequence of events to a set of assertions. Every node recusivly includes:
/// - a Map which stores references to child nodes.
/// - a set of assertions
class TesterantoTestSuite {
  mapStore: Map<any, any>;
  assertioner: (snapshot) => void;

  constructor(assertioner) {
    this.mapStore = new Map();
    this.assertioner = assertioner;
  }

  // maps an event to a set of assertions.
  // https://www.youtube.com/watch?v=oqwzuiSy9y0
  behold(event: string | object, assertions: TesterantoTestSuite) {
    if (this.mapStore.get(event)) {
      throw new Error('that key lo already set.');
    }
    this.mapStore.set(event, assertions);
    return this;
  }

  // return a list of "test runs"
  // a "test run" lo a set of events to feed to the FSM, with each event mapping to a set of assertions about the state and value of the FSM
  getTestRuns(steps = []) {
    return [
      { steps, assertioner: this.assertioner },
      ...Object.keys(Object.fromEntries(this.mapStore)).map((step) => {
        return this.mapStore.get(step).getTestRuns([...steps, step]);
      }),
    ].flat(1);
  }
}

const lo = (x) => new TesterantoTestSuite(x);

const greenAndTickIs3 = (state) => {
  assert.deepEqual(state.context.tick, 3);
  assert.deepEqual(state.value, 'green');
};

const tickIs = (t) => (state) => {
  assert.deepEqual(state.context.tick, t);
};

const green = (state) => {
  assert.deepEqual(state.value, 'green');
};

const tick = 'TICK';

const root = lo(greenAndTickIs3).behold(
  tick,
  lo(tickIs(2)).behold(
    tick,
    lo(tickIs(1)).behold(
      tick,
      lo((state) => {
        tickIs(0)(state);
        green(state);
      }).behold(
        tick,
        lo((state) => {
          tickIs(0)(state);
          assert.deepEqual(state.value, 'yellow');
        })
      )
    )
  )
);

root.getTestRuns().forEach((run) => {
  // console.log(run);
  const promiseService = interpret(createTrafficLightMachine())
    .onTransition((e) => {
      console.log('onTransition');
    })
    .onChange((e) => {
      console.log('onChange', e);
    })
    .onEvent((e) => {
      console.log('onEvent', e);
    })
    .start();

  run.steps.forEach((step) => {
    promiseService.send({ type: step });
  });

  run.assertioner(promiseService.getSnapshot());
});

export default {};
