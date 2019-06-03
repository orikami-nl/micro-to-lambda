var Stream = require('stream');
var { run } = require('micro');
var qs = require('query-string');

function createRequest(event, context) {
    var request = new Stream.Readable();
    request._read = function noop(){};
    if(event.body){
      const body = typeof event.body === "string" ? event.body : JSON.stringify(event.body);
      request.push(body);
    }
    request.push(null);

    request.url = event.path;
    if(event.queryStringParameters) {
      request.url += "?" + qs.stringify(event.queryStringParameters);
    }
    request.event = event;
    request.context = context;
    request.headers = {};
    request.rawHeaders = [];
    request.httpVersion = "1.1";
    request.method = event.httpMethod;

    Object.keys(event.headers || {})
      .forEach(key => {
        request.headers[key.toLowerCase()] = event.headers[key];
        request.rawHeaders.push(key);
        request.rawHeaders.push(event.headers[key]);
      });

    return request;
}

function createResponse() {
    var response = new Stream.Writable();
    response.statusCode = 200;
    response.headers = {};
    response.body = "";
    response.setHeader = function(key,val) {
      response.headers[key] = val;
    };
    response.getHeader = function(key) {
      return response.headers[key];
    };
    response._write = function (chunk, encoding, done) {
      response.body += chunk.toString();
      done();
    };
    response.toLambdaResponse = function(){
      return {
        isBase64Encoded: true,
        statusCode: response.statusCode,
        headers: response.headers,
        body: response.body
      };
    }
    return response;
}

module.exports = function microToLambdaHandler(fn, opts = {}) {
  return function lambdaHandler(event, context, callback) {
    const keepAlive = (opts.callbackWaitsForEmptyEventLoop === false || opts.keepAlive === true)

    if(keepAlive && opts.iPromiseToCloseDatabaseConnections !== true) {
      console.error("ERROR: When you keep the AWS Lambda alive, you must promise to close the database connections.");
      console.error("FIX: micro-to-lambda(handler, { keepAlive: true, iPromiseToCloseDatabaseConnections: true })");
      callback(new Error("Did not promise to close database connection"))
      return
    }

    context.callbackWaitsForEmptyEventLoop = !keepAlive;
    var req = createRequest(event, context);
    var res = createResponse();
    run(req,res,fn)
      .then(() => {
        callback(null,res.toLambdaResponse())
      })
      .catch(err => {
        callback(err);
      });
  }
}
