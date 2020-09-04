'use strict';

const Hapi = require('@hapi/hapi');
const { readFile, writeFile } = require('fs').promises;
const path = require('path');
const _ = require('lodash');
const HTTP_CREATED = 201;

const server = new Hapi.Server({ port: 8000, host: 'localhost' });

server.route({
  method: 'GET',
  path: '/',
  handler: (request, h) => {
    return 'Hello! from the car-buying-service.\n';
  },
});

server.route({
  method: 'GET',
  path: '/vehicles',
  handler: async (request, h) => {
    try {
      const vehicles = await readFile(path.resolve('data', 'vehicles.json'), 'utf8');
      return h.response(JSON.parse(vehicles));
    } catch (error) {
      console.log('Vehicles READ ERROR');
      return h.response('Vehicles READ ERROR').code(500);
    }
  },
});

server.route({
  method: 'GET',
  path: '/transactions',
  handler: async (request, h) => {
    try {
      const transactions = await readFile(path.resolve('data', 'transactions.json'), 'utf8');
      return h.response(JSON.parse(transactions));
    } catch (error) {
      console.log('Transactions READ ERROR');
      return h.response('').code(500);
    }
  },
});

server.route({
  method: 'GET',
  path: '/get-negotiations',
  handler: async (request, h) => {
    try {
      const transactions = await readFile(path.resolve('data', 'transactions.json'), 'utf8');
      const parsedData = JSON.parse(transactions);
      const found = _.filter(parsedData, { status: 'NEGOTIATION' });
      if (!_.isEmpty(found)) {
        return found;
      } else {
        return '';
      }
    } catch (error) {
      console.log('Transactions READ ERROR');
      return h.response('').code(500);
    }
  },
});

server.route({
  method: 'POST',
  path: '/create-transaction',
  handler: async (request, h) => {
    let transactions;
    try {
      transactions = await readFile(path.resolve('data', 'transactions.json'), 'utf8');
      const parsedData = JSON.parse(transactions);
      const payload = request.payload;
      payload.id = Date.now();
      payload.customer_id = Number(payload.customer_id);
      parsedData.push(payload);
      await writeFile(
        path.join(process.cwd(), 'data/transactions.json'),
        JSON.stringify(parsedData, null, 2) + '\n',
        'utf-8');
      return h.response(payload).code(HTTP_CREATED);
    } catch (error) {
      if (transactions) {
        return h.response('Write Error').code(500);
      } else {
        console.log('Transactions READ ERROR');
        return 'Transactions UPDATE ERROR';
      }
    }
  },
});

server.route({
  method: 'POST',
  path: '/update-transaction',
  handler: async (request, h) => {
    let transactions;
    try {
      transactions = await readFile(path.resolve('data', 'transactions.json'), 'utf8');
      const parsedData = JSON.parse(transactions);
      const found = _.find(parsedData, {
        id: Number(request.payload.id),
        status: 'NEGOTIATION',
      });

      if (!_.isEmpty(found)) {
        if (request.payload.comments) {
          found.comments = request.payload.comments;
        }
        if (request.payload.status) {
          found.status = request.payload.status;
        }
        await writeFile(
          path.join(process.cwd(), 'data/transactions.json'),
          JSON.stringify(parsedData, null, 2) + '\n',
          'utf-8');
        return h.response(found).code(HTTP_CREATED);
      } else {
        return h.response('NOT FOUND').code(HTTP_CREATED);
      }
    } catch (error) {
      if (transactions) {
        return h.response('Write Error').code(500);
      } else {
        console.log('Transactions READ ERROR');
        return 'Transactions UPDATE ERROR';
      }
    }
  },
});

exports.init = async () => {
  await server.initialize();
  return server;
};

exports.start = async () => {
  await server.register(require('@hapi/inert'));
  server.route({
    method: 'GET',
    path: '/images/{param*}',
    handler: {
      directory: {
        path: 'images',
      },
    },
  });
  await server.start();
  console.log('Server running on %s', server.info.uri);
  return server;
};

process.on('unhandledRejection', (err) => {
  console.log(err);
  process.exit(1);
});
