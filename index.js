"use strict";

const Hapi = require("hapi");
const Inert = require("inert");
const fs = require("fs");
const path = require("path");
const _ = require("lodash");
const HTTP_CREATED = 201;

const server = new Hapi.Server();
server.connection({ port: 8000, host: "localhost" });

server.register(
  {
    register: require("inert")
  },
  function(err) {
    if (err) throw err;

    server.start(err => {
      if (err) {
        throw err;
      }
      console.log(`Server running at: ${server.info.uri}`);
    });
  }
);

server.route({
  method: "GET",
  path: "/images/{param*}",
  handler: {
    directory: {
      path: "images"
    }
  }
});

server.route({
  method: "GET",
  path: "/vehicles",
  handler: (request, reply) => {
    fs.readFile(path.resolve("data", "vehicles.json"), "utf8", (err, data) => {
      if (err) {
        console.log("Vehicles READ ERROR");
        return reply("Vehicles READ ERROR").code(500);
      }
      return reply(JSON.parse(data));
    });
  }
});

server.route({
  method: "GET",
  path: "/transactions",
  handler: (request, reply) => {
    fs.readFile(path.resolve("data", "transactions.json"), "utf8", (err, data) => {
      if (err) {
        console.log("Transactions READ ERROR");
        return reply();
      }
      return reply(JSON.parse(data));
    });
  }
});

server.route({
  method: "GET",
  path: "/get-negotiations",
  handler: (request, reply) => {
    fs.readFile(path.resolve("data", "transactions.json"), "utf8", (err, data) => {
      if (err) {
        console.log("Transactions READ ERROR");
        return reply();
      }
      const parsedData = JSON.parse(data);
      const found = _.filter(parsedData, { status: "NEGOTIATION" });
      if (!_.isEmpty(found)) {
        return reply(found);
      } else {
        return reply();
      }
    });
  }
});

server.route({
  method: "POST",
  path: "/create-transaction",
  handler: (request, reply) => {
    fs.readFile(path.resolve("data", "transactions.json"), "utf8", (readErr, data) => {
      if (readErr) {
        console.log("Transactions READ ERROR");
        return reply("Transactions UPDATE ERROR");
      }
      const parsedData = JSON.parse(data);
      const payload = request.payload;
      payload.id = Date.now();
      parsedData.push(payload);

      fs.writeFile(
        path.join(process.cwd(), "data/transactions.json"),
        JSON.stringify(parsedData),
        "utf-8",
        writeErr => {
          if (writeErr) {
            return reply("Write Error").code(HTTP_ISE);
          } else {
            return reply(payload).code(HTTP_CREATED);
          }
        }
      );
    });
  }
});

server.route({
  method: "POST",
  path: "/update-transaction",
  handler: (request, reply) => {
    fs.readFile(path.resolve("data", "transactions.json"), "utf8", (readErr, data) => {
      if (readErr) {
        console.log("Transactions READ ERROR");
        return reply("Transactions UPDATE ERROR");
      }
      const parsedData = JSON.parse(data);
      const found = _.find(parsedData, {
        id: parseInt(request.payload.id),
        status: "NEGOTIATION"
      });

      if (!_.isEmpty(found)) {
        if (request.payload.comments) {
          found.comments = request.payload.comments;
        }
        if (request.payload.status) {
          found.status = request.payload.status;
        }
        fs.writeFile(
          path.join(process.cwd(), "data/transactions.json"),
          JSON.stringify(parsedData),
          "utf-8",
          writeErr => {
            if (writeErr) {
              return reply("Write Error").code(HTTP_ISE);
            } else {
              return reply(found).code(HTTP_CREATED);
            }
          }
        );
      } else {
        return reply("NOT FOUND").code(HTTP_CREATED);
      }
    });
  }
});
