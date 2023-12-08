# PostgreSQL real-time notifications through SSE
A study on PG's LISTEN/NOTIFY and SSE. Minimal implementation using Node.js and Docker.

## Running the app
On a terminal in project root, run:
```bash
docker compose up -d --build
```
```bash
npm install
npm run dev
```

## How it works
The app is composed of a Node.js server and a PostgreSQL database. The server is responsible for handling the SSE connections and the database is responsible for storing the data and sending notifications to the server whenever something happens to it.

### Listening to changes:
On your terminal:
```bash
curl -N localhost:3000
```

Or simply open [`http://localhost:3000`](http://localhost:3000) on your browser.

### Inserting data:
Insert a random new record with:
```bash
curl -X POST localhost:3000/add
```

Alternatively, open [`http://localhost:8080`](http://localhost:8080) on your browser to access Adminer's interface. Use the same credentials given in docker-compose, including the container name as the network location (pgdb). There you can insert data into the table using the GUI and see the changes being notified on the SSE connection.
