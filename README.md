execOncePerArgs
===

call a function once for a given set of args

    const execOncePerArgs = require('./index').execOncePerArgs;
    const _               = require('lodash');
    const crypto          = require('crypto');

    let iCalled = 0;

    const someFunc = (a,b,c) => {
      console.log({ action: 'someFunc.called', iCalled: iCalled });
      iCalled++;

      return a + b + c;
    }

    let options = {
      func: someFunc,
      thisArg: undefined,
      args: [0,1,2],
    }
    
    options.sHash = crypto.createHash('sha256').update(options.func.toString() + options.args.toString()).digest('hex');

    let result = null;
    for (let i = 0;i < 1000000;i++) {
      result = execOncePerArgs(options);
    }
    console.log(result);

    // outputs:
    // { action: 'someFunc.called', iCalled: 0 }
    // 3

