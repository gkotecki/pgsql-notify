import express from 'express'
import _pgp from 'pg-promise'

const app = express()
const port = 3000

const pgp = _pgp()
const db = pgp('postgresql://qweqwe:123123@localhost:5432/ntfdb')

try {
	const c = await db.connect()
	c.done() // success, release the connection;
	console.log('Connected to PostgreSQL')
} catch (error) {
	console.log('ERROR:', error.message || error)
}

db.query(
	`CREATE TABLE IF NOT EXISTS records (
		id SERIAL,
		label VARCHAR(64) NOT NULL,
		value VARCHAR(64) NOT NULL
	);` 
	// + `INSERT INTO records (label, value) VALUES ('one', '1'), ('two', '2'), ('three', '3'), ('four', '4')`,
)

app.listen(port, () => {
	console.log(`Example app listening on port ${port}`)
})

app.get('/', (req, res) => {
	res.setHeader('Cache-Control', 'no-cache')
	res.setHeader('Content-Type', 'text/event-stream')
	res.setHeader('Connection', 'keep-alive')
	res.flushHeaders() // flush the headers to establish SSE with client

	// https://github.com/vitaly-t/pg-promise/wiki/Learn-by-Example#listen--notify
	// https://stackoverflow.com/questions/45427280/postgres-listen-notify-with-pg-promise

	let counter = 0
	let interValID = setInterval(() => {
		counter++
		if (counter >= 10) {
			clearInterval(interValID)
			res.end() // terminates SSE session
			return
		}
		res.write(`data: ${JSON.stringify({ num: counter })}\n\n`) // res.write() instead of res.send()
	}, 1000)

	// If client closes connection, stop sending events
	res.on('close', () => {
		console.log('client dropped me')
		clearInterval(interValID)
		res.end()
	})
})
