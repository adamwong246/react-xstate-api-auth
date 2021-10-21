import { createMachine, assign } from 'xstate';
const maxTicks = 3;
export const createTrafficLightMachine = () => {
    const trafficLightState = (from, to) => {
        return {
            [from]: {
                on: {
                    TICK: {
                        actions: assign((context, event) => {
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
    return createMachine({
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
