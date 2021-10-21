import { assign, createMachine } from 'xstate';
import { authService } from '../service';
import STATES from './states';
import EVENTS from './events';
import createAuthMachine from './createAuthMachine';
const authMachine = createAuthMachine({ authService });
const lightMachine = createMachine({
    key: 'light',
    initial: 'green',
    context: { timer: 10, tick: 3 },
    states: {
        green: {
            on: {
                TIMER: { target: 'yellow' },
                POWER_OUTAGE: { target: 'red' },
                TICK: {
                    target: 'yellow',
                    internal: false,
                    cond: (context, event) => {
                        return context.tick === 0;
                    },
                    actions: assign((context, event) => {
                        return {
                            tick: context.tick - 1
                        };
                    }),
                }
            },
        },
        yellow: {
            on: {
                TIMER: { target: 'red' },
                POWER_OUTAGE: { target: 'red' }
            }
        },
        red: {
            on: {
                TIMER: { target: 'green' },
                POWER_OUTAGE: { target: 'red' },
            },
            initial: 'walk',
            states: {
                walk: {
                    on: {
                        TIMER: { target: 'wait',
                            // actions: assign((context, event): any => {
                            //   return {
                            //     timer: 10
                            //   }
                            // }), 
                        },
                    },
                },
                wait: {
                    on: {
                        TIMER: {
                            target: 'stop',
                            // actions: assign((context, event): any => {
                            //   console.log("mark")
                            //   return {
                            //     timer: context.timer - 1
                            //   }
                            // }),
                            // cond: (context, event) => {
                            //   return context.timer < 0
                            // },
                        },
                    },
                },
                stop: {
                    // Transient transition
                    on: {
                        '': { target: '#light.green' },
                    },
                },
            },
        },
    },
});
const lightTesterato = [
    { steps: [], assertion: 'green' },
    { steps: ['TIMER'], assertion: 'yellow' },
    { steps: ['TIMER', 'TIMER'], assertion: { red: 'walk' } },
    { steps: ['TIMER', 'TIMER', 'TIMER'], assertion: 'green' },
    { steps: ['TIMER', 'TIMER', 'POWER_OUTAGE'], assertion: { red: 'walk' } },
];
export { authMachine, STATES, EVENTS, lightMachine, lightTesterato };
