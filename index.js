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
        statusCode: response.statusCode,
        headers: response.headers,
        body: response.body
      };
    }
    return response;
}

module.exports = function microToLambdaHandler(fn) {
  return function lambdaHandler(event, context, callback) {
    context.callbackWaitsForEmptyEventLoop = false;
    var req = createRequest(event, context);
    var res = createResponse();
    console.log('micro.run');
    run(req,res,fn)
      .then(() => {
        console.log('micro.run finished');
        callback(null,res.toLambdaResponse())
        // process.exit(); // TODO this will not reuse the DB connection.. find a better way!
      })
      .catch(err => {
        callback(err);
        // process.exit();// TODO this will not reuse the DB connection.. find a better way!
      });
  }
}
