# car-buying-service

A Node.js/[hapi][1] server that supports the car-buying app.
It provides a set of service end points that support create/update endpoints
for the data used in the car-buying app.

## Usage

To run the server:

```sh
npm start
```

Run the server in dev mode (nodemon):

```sh
npm dev
```

## API Endpoints

| Path | Method | Purpose |
| --- | --- | --- |
| /vehicles | GET | Return all vehicles in record |
| /transactions | GET | Return all transactions in record |
| /get-negotiations | GET | Return all transactions of type Negotiation |
| /create-transaction | POST | Create a new transaction |
| /update-transaction | POST | Update a transaction |

[1]: https://hapi.dev/
