#!/usr/bin/env node
const toLambda = require("@orikami/micro-to-lambda");

// Test "keep alive" option of AWS Lambda
let counter = 0;
const handler = (req, res) => {
  counter++
  return { counter }
}

// Default export: the micro function handler
module.exports = handler;

// Lambda export: exit (default)
module.exports.exit = toLambda(handler);

// Lambda export: keep alive (optional)
module.exports.keepalive = toLambda(handler, { keepAlive: true, iPromiseToCloseDatabaseConnections: true })

// Lambda export: keep alive error
module.exports.error = toLambda(handler, { keepAlive: true })

// Run in bash
if (require.main === module) {
  const micro = require("micro");
  const server = micro(handler);
  server.listen(process.env.PORT || 3000);
}
