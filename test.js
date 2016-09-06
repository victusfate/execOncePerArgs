'use strict';

const execOncePerArgs = require('./index').execOncePerArgs;
const retries         = require('./index').retries;
const _               = require('lodash');
const crypto          = require('crypto');

{
  const sTest = 'execOncePerArgs';
  let iCalled = 0;

  const someFunc = (a,b,c,name) => {
    console.log({ action: sTest + '.'+ name + '.called', iCalled: iCalled });
    iCalled++;

    return new Promise( (resolve,reject) => {
      if (iCalled < 3) {
        reject(Error( sTest + '.' + name + '.err.'+iCalled));
      }
      else {
        setTimeout( () => {
          resolve(a + b + c);
        },Math.random() * 1000);        
      }
    })
  }

  let options = {
    promiseFunc : someFunc,
    thisArg     : undefined,
    args        : [0,1,2,'f1'],
    maxAttempts : 2,
    TTL         : 0 // blocks for 0 ms
  }
  // options.sHash = func.toString() + args.toString();  
  options.sHash = crypto.createHash('sha256').update(options.promiseFunc.toString() + options.args.toString()).digest('hex');

  let optionsB = {
    promiseFunc: someFunc,
    thisArg: undefined,
    args: [3,4,5,'f2'],
    maxAttempts : 2,
    TTL         : 60 * 1000 // blocks for 1 minute
  }
  optionsB.sHash = crypto.createHash('sha256').update(optionsB.promiseFunc.toString() + optionsB.args.toString()).digest('hex');

  let tStart = Date.now();
  let aPromises = [];
  const N = 10; // 250000; // memory issue with 500k -> 1million stored promises with retries
  for (let i = 0;i < N;i++) {
    setTimeout( () => { // stagger calls
      aPromises.push(execOncePerArgs(options));  
      aPromises.push(execOncePerArgs(optionsB));  
    }, i * 100);
  }
  Promise.all(aPromises).then( () => {
    let dT = Date.now() - tStart;
    console.log({ action: sTest + '.promises.complete', dT: dT + ' ms' });
  })
  .catch( (err) => {
    console.log({ action: sTest + '.promises.err', err:err });
  })
}
{
  // alternative method, had some issues getting memoize promises to resolve
  // let tNext = Date.now();
  // let bPromises = [];
  // let newFunc = _.memoize(options.func, (args) => { return args.toString(); });

  // const blah = newFunc(options.args);
  // console.log({ action:'newFunc', blah:blah }); 
  // blah.then( (res) => {
  //   console.log({ action:'complete memoize time', dT: dT + ' ms', data:data });  
  // })

  // for (let i=0;i < N;i++) {
  //   bPromises.push(newFunc(options.args));
  // }
  // Promise.all(bPromises).then( (data) => {
  //   let dT = Date.now() - tNext;
  //   console.log({ action:'complete memoize time', dT: dT + ' ms', data:data });
  // })
}
{

  const sTest = 'retries';

  // retries
  let iCalled = 0;

  const someOtherFunc = (a,b,c) => {
    console.log({ action: 'someOtherFunc.called', iCalled: iCalled });
    iCalled++;

    return new Promise( (resolve,reject) => {
      if (iCalled < 3) {
        reject(Error(sTest + '.someOtherFunc.err.'+iCalled));
      }
      else {
        setTimeout( () => {
          resolve(a + b + c);
        },Math.random() * 1000);        
      }
    })
  }
  const args        = [0,1,2];
  const maxAttempts = 3;

  retries(someOtherFunc,this,args,0,maxAttempts)
  .then( (data) => {
    console.log({ action: sTest + '.complete', data:data })
  })
  .catch( (err) => {
    console.error({ action: sTest + '.err.should.not.happen', err:err });
  })
}
