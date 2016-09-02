execOncePerArgs
===

call a promise returning function once (successfully) for a given set of args. If error it removes itself from blocking future attempts. known issues: my test is a memory hog (500k promises with retries)

    const execOncePerArgs = require('./index').execOncePerArgs;
    const _               = require('lodash');
    const crypto          = require('crypto');

    let iCalled = 0;

    const someFunc = (a,b,c) => {
      console.log({ action: 'someFunc.called', iCalled: iCalled });
      iCalled++;

      return new Promise( (resolve,reject) => {
        if (iCalled < 3) {
          reject(Error('someFunc.err.'+iCalled));
        }
        else {
          setTimeout( () => {
            resolve(a + b + c);
          },Math.random() * 1000);        
        }
      })
    }

    let options = {
      func: someFunc,
      thisArg: undefined,
      args: [0,1,2],
      maxAttempts: 2
    }
    // options.sHash = func.toString() + args.toString();  
    options.sHash = crypto.createHash('sha256').update(options.func.toString() + options.args.toString()).digest('hex');

    let optionsB = {
      func: someFunc,
      thisArg: undefined,
      args: [3,4,5],
      maxAttempts: 2
    }
    optionsB.sHash = crypto.createHash('sha256').update(optionsB.func.toString() + optionsB.args.toString()).digest('hex');



    let tStart = Date.now();
    let aPromises = [];
    const N = 250000;
    for (let i = 0;i < N;i++) {
      aPromises.push(execOncePerArgs(options));  
      aPromises.push(execOncePerArgs(optionsB));  
    }
    Promise.all(aPromises).then( () => {
      let dT = Date.now() - tStart;
      console.log({ action: 'promises complete time', dT: dT + ' ms' });
    })


retries
===

    // retries
    const someOtherFunc = (a,b,c) => {
      console.log({ action: 'someOtherFunc.called', iCalled: iCalled });
      iCalled++;

      return new Promise( (resolve,reject) => {
        if (iCalled < 3) {
          reject(Error('someOtherFunc.err.'+iCalled));
        }
        else {
          setTimeout( () => {
            resolve(a + b + c);
          },Math.random() * 1000);        
        }
      })
    }
    const args = [0,1,2];
    const maxAttempts = 3;

    retries(someOtherFunc,this,args,0,maxAttempts).then( (data) => {
      console.log({ action:'retries', data:data })
    })
    .catch( (err) => {
      console.error({ action: 'retries.err.should.not.happen' });
    })

