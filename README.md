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

If you're using `async` or `await` syntax, it is recommended to use the
`async-to-gen` helper to make code compatible for node 6.10.x

```javascript
require("async-to-gen/register");
```
