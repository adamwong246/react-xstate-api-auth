console.log("hello world");
const assert = require("assert");
assert(true);

const fsm = require("../client/src/machine");
const testMachine = fsm.authMachine;
console.log(testMachine);
