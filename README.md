# micro-to-lambda

Convert a [micro](https://github.com/zeit/micro) function to a lambda handler.

## Install
```
npm install --save @orikami/micro-to-lambda
```


## Usage

Given a micro function in `index.js`
```
module.exports = (req,res) => ({ time: new Date() })
```

Convert it to a lambda function in `handler.js`:
```
var microToLambda = require('micro-to-lambda');
var index = require('./index');
module.exports.time = microToLambda(index);
```

By default, the lambda will terminate the process after every request.
If you want to keep the process alive, use:

```
microToLambda(handler, { keepAlive: true, iPromiseToCloseDatabaseConnections: true })
```

As you can see, you have to promise to close all database connections (to MongoDB). Otherwise, the autoscaling of lambda can cause trouble for the connection limit of the database.


```javascript
require("async-to-gen/register");
```

## Changelog

1.2.1 - Remove process.exit() to fix error.
1.1.1 - Close AWS Lambda after every process. (HAS ERRORS)
0.0.01 - Initial release
