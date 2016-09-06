'use strict';

const _                 = require('lodash');


const sModule = 'execOncePerArgs';

const exists = (obj) => {
  return (obj !== undefined && obj !== null);
}

// could be redis or memcache shared store
let queues = {};

// allow are once call to retry a few times
const retries = (promiseFun,thisArg,argsArray,nAttempts,maxAttempts) => {
  const sAction = 'retries';

  return new Promise( (resolve,reject) => {
    if (typeof promiseFun !== 'function') {
      reject(Error('retries, type of promiseFun is not function type? '+typeof promiseFun+' promiseFun '+promiseFun));
    }
    else if (!Array.isArray(argsArray)) {
      reject(Error(promiseFun.name+' retries, type of argsArray is not an Array ',argsArray));
    }
    else if (typeof nAttempts !== 'number') {
      reject(Error(promiseFun.name+' retries, type of nAttempts is not a number '+nAttempts+' typeof '+ typeof nAttempts)); 
    }
    else if (typeof maxAttempts !== 'number' || maxAttempts < 1) {
      reject(Error(promiseFun.name+' retries, type of maxAttempts is not a number '+maxAttempts+' typeof '+ typeof maxAttempts + ' or must be at least 1')); 
    }
    else {
      nAttempts++;
      promiseFun.apply(thisArg,argsArray).then( function(res) {
        resolve(res);
      })
      .catch( (err) => {
        if (nAttempts >= maxAttempts) {
          console.error({ action: sAction + '.max.retries.err', nAttempts: nAttempts, maxAttempts: maxAttempts, promiseFuncName: promiseFun.name, args: argsArray });
          reject(err);
        }
        else {
          console.log({ action: sAction + '.retrying', nAttempts: nAttempts, maxAttempts: maxAttempts, promiseFuncName: promiseFun.name, args: argsArray });
          const delay = Math.pow(2,nAttempts) * 1000;
          setTimeout(() => {
            resolve(retries(promiseFun,thisArg,argsArray,nAttempts,maxAttempts));
          }, delay);            
        }
      });
    }
  });
}



// calls a function once per args, no optimization done on unique function + args combination
const execOncePerArgs = (options) => {
  const sAction =  sModule + '.execOncePerArgs';

  const promiseFunc   = options.promiseFunc;
  const thisArg       = options.thisArg;
  const args          = options.args;
  const sHash         = options.sHash;
  const maxAttempts   = exists(options.maxAttempts) && Math.floor(options.maxAttempts) === options.maxAttempts ? options.maxAttempts : 1;
  const TTL           = options.TTL; // time block is good for in ms


  if (typeof promiseFunc !== 'function' || Array.isArray(args) !== true || typeof sHash !== 'string' || sHash.length < 1) {
    const oErr = { action: sAction + '.invalid.inputs.err', options: options, typeOfFunc: typeof promiseFunc, aArgsIsArray: Array.isArray(args) };
    console.error(oErr);
    // throw new Error(`${oErr}`);
    return;
  }

  let oQueue = queues[sHash];
  if (!exists(oQueue)) {
    // console.log({ action: sAction + '.storing.hash', sHash:sHash});
    oQueue = queues[sHash] = {
      promiseFunc : _.once( () => {
        return retries(promiseFunc,thisArg,args,0,maxAttempts);
      }),
      thisArg     : thisArg,
      args        : args
    } 
  }
  // else {
  //   console.log({ action: sAction + '.hash.exists', sHash:sHash});
  // }

  if (typeof TTL === 'number') {
    setTimeout( () => {
      // console.log({ action: sAction + '.removing.blocker', sHash:sHash});
      delete queues[sHash];
    },TTL);
  }

  return oQueue.promiseFunc.apply(oQueue.thisArg,oQueue.args);
}

module.exports = {
  execOncePerArgs : execOncePerArgs,
  retries         : retries
}
