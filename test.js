'use strict';

const execOncePerArgs = require('./index').execOncePerArgs;
const _               = require('lodash');
const crypto          = require('crypto');

{
  let iCalled = 0;

  const someFunc = (a,b,c) => {
    console.log({ action: 'someFunc.called', iCalled: iCalled });
    iCalled++;

    return new Promise( (resolve,reject) => {
      setTimeout( () => {
        resolve(a + b + c);
      },Math.random() * 1000);
    })
  }

  let options = {
    func: someFunc,
    thisArg: undefined,
    args: [0,1,2],
  }
  // options.sHash = func.toString() + args.toString();  
  options.sHash = crypto.createHash('sha256').update(options.func.toString() + options.args.toString()).digest('hex');

  let optionsB = {
    func: someFunc,
    thisArg: undefined,
    args: [3,4,5],
  }
  optionsB.sHash = crypto.createHash('sha256').update(optionsB.func.toString() + optionsB.args.toString()).digest('hex');



  let tStart = Date.now();
  let aPromises = [];
  const N = 500000;
  for (let i = 0;i < N;i++) {
    aPromises.push(execOncePerArgs(options));  
    aPromises.push(execOncePerArgs(optionsB));  
  }
  Promise.all(aPromises).then( () => {
    let dT = Date.now() - tStart;
    console.log({ action: 'promises complete time', dT: dT + ' ms' });
  })
}
{
  // had some issues getting memoize promises to resolve
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

// non promise test
{
    let iCalled = 0;

    const anotherFunc = (a,b,c) => {
      console.log({ action: 'anotherFunc.called', iCalled: iCalled });
      iCalled++;

      return a + b + c;
    }

    let options = {
      func: anotherFunc,
      thisArg: undefined,
      args: [0,1,2],
    }
    
    options.sHash = crypto.createHash('sha256').update(options.func.toString() + options.args.toString()).digest('hex');

    let result = null;
    for (let i = 0;i < 1000000;i++) {
      result = execOncePerArgs(options);
    }
    console.log(result);
}