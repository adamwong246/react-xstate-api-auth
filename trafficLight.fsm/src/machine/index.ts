import { createMachine, Machine, assign, send } from 'xstate';

const maxTicks = 3;

export const createTrafficLightMachine = () => {
  type LightEvent = { type: 'TICK' };

  interface LightContext {
    tick: number;
  }

  const trafficLightState = (from: string, to: string) => {
    return {
      [from]: {
        on: {
          TICK: {
            actions: assign((context: { tick: number }, event) => {
              const tick = Math.max(context.tick - 1, 0);

              if (tick === 0) {
                // change to the next state and reset the context.ticks to maxTicks
                // send({ type: to })
              }

              return {
                tick,
              };
            }),
          },
        },
      },
    };
  };

  return createMachine<LightContext, LightEvent>({
    key: 'light',
    initial: 'green',
    context: { tick: maxTicks },
    states: {
      ...trafficLightState('green', 'yellow'),
      ...trafficLightState('yellow', 'red'),
      ...trafficLightState('red', 'green'),
    },
  });
};
