import { ActionObject, AnyEventObject, createMachine, StateMachine } from 'xstate';
import { authMachine, lightMachine } from '../../client/src/machine/index.js';

const a: any = authMachine;
const p: any = lightMachine;

export default {
  bar: 'boo',
  authMachine: a,
  lightMachine: p,
};
