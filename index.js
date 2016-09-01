'use strict';

const _                 = require('lodash');


const sModule = 'execOncePerArgs';

const exists = (obj) => {
  return (obj !== undefined && obj !== null);
}

let queues = {};

// calls a function once per args, no optimization done on unique function + args combination
const execOncePerArgs = (options) => {
  const sAction =  sModule + '.execOncePerArgs';

  const func    = options.func;
  const thisArg = options.thisArg;
  const args    = options.args;
  const sHash   = options.sHash;


  if (typeof func !== 'function' || Array.isArray(args) !== true || typeof sHash !== 'string' || sHash.length < 1) {
    const oErr = { action: sAction + '.invalid.inputs.err', options: options, typeOfFunc: typeof func, aArgsIsArray: Array.isArray(args) };
    console.error(oErr);
    // throw new Error(`${oErr}`);
    return;
  }

  let oQueue = queues[sHash];
  if (!exists(oQueue)) {
    oQueue = queues[sHash] = {
      func     : _.once( () => {
        return func.apply(thisArg,args);
      }),
      thisArg  : thisArg,
      args     : args
    }
  }

  return oQueue.func.apply(oQueue.thisArg,oQueue.args);
}

module.exports = {
  execOncePerArgs : execOncePerArgs
}
