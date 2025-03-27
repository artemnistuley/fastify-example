'use strict';

const path = require('node:path');
const fastifyStatic = require('@fastify/static');

function init(server, routes) {
  for (const [iface, methods] of Object.entries(routes)) {
    for (const [method, hander] of Object.entries(methods)) {
      if (typeof hander !== 'function') continue;
      server.post(`/api/${iface}/${method}`, async (request) => {
        const { query, body, headers } = request;
        // Other options might be
        // { ...query, ...body } or ...body.args
        const response = await hander(...body);
        return response;
      });
    }
  }
}

function initStatic(server) {
  const staticPath = path.join(process.cwd(), 'static');
  server.register(fastifyStatic, {
    root: staticPath,
    wildcard: true,
  });
}

const start = async (server, config) => {
  await server.listen(config);
  server.log.info(`API on port ${config.port}`);
};

module.exports = {
  init,
  initStatic,
  start,
};
