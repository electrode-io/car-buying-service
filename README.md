# car-buying-service

This a node/HapiJS server that supports the car-buying app.
It provides a set of service end points that support create/update endpoints for the data used in the car-buying app.

To run the server 

```bash
npm start
```

## API ENDPOINTS:

| Path | Method | Purpose |
| --- | --- | --- |
| /vehicles | GET | Return all vehicles in record. |
| /transactions | GET | Return all transactions in record. |
| /get-negotiations | GET | Return all transactions of type Negotiation. |
| /create-transaction | POST | Create a new transaction. |
| /update-transaction | POST | Update a transaction. |
