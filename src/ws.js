'use strict';

const websocket = require('@fastify/websocket');

function init(server, routes) {
  server.register(websocket);
  server.register(async function (server) {
    server.get('/api', { websocket: true }, (socket) => {
      socket.on('message', async (message) => {
        console.log(message);
        try {
          const { name, method, args = [] } = JSON.parse(message);
          const handler = routes?.[name]?.[method];

          if (!handler) {
            return socket.send('"Not found"', { binary: false });
          }

          const result = await handler(...args);
          socket.send(JSON.stringify(result), { binary: false });
        } catch (err) {
          server.log.error(err);
          socket.send('"Server error"', { binary: false });
        }
      });
    });
  });
}

module.exports = { init };
