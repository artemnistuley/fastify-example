'use strict';

const fastify = require('fastify');
const http = require('./src/http.js');
const ws = require('./src/ws.js');
const { Logger, StreamForLogger } = require('./lib/logger.js');
const { loadApp } = require('./src/loader.js');

const LOG_PATH = './log';

(async () => {
  const streamForLogger = new StreamForLogger(LOG_PATH);
  const server = fastify({ 
    logger: { level: 'info', stream: streamForLogger } 
  });

  const logger = new Logger(server.log);
  const app = await loadApp({ logger });
  
  http.init(server, app.api);
  http.initStatic(server);
  ws.init(server, app.api);
  http.start(server, { port: app.config.server.ports[0] });
})();
