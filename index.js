import express from 'express'
import fs from 'fs'
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

db.query(fs.readFileSync('./init.pgsql', 'utf8'))

app.listen(port, () => {
	console.log(`Example app listening on port ${port}`)
})

app.get('/', async (req, res) => {
	res.setHeader('Content-Type', 'text/event-stream')
	res.setHeader('Connection', 'keep-alive')
	res.flushHeaders() // flush the headers to establish SSE with client

	// https://github.com/vitaly-t/pg-promise/wiki/Learn-by-Example#listen--notify
	// https://stackoverflow.com/questions/45427280/postgres-listen-notify-with-pg-promise

	const sco = await db.connect()

	sco.client.on('notification', (data) => {
		console.log('Received:', data)
		res.write(`data: ${JSON.stringify(data)}\n\n`)
	})

	sco.none('LISTEN "records-changes"')

	// let counter = 1
	// let interValID = setInterval(async () => {
	// 	if (counter > 3) {
	// 		clearInterval(interValID)
	// 		await sco.done()
	// 		res.end() // terminates SSE session
	// 		return
	// 	}
	// 	sco.none(`NOTIFY "records-changes", '${JSON.stringify({ counter })}'`)
	// 	counter++
	// }, 500)

	// If client closes connection, stop sending events
	res.on('close', () => {
		console.log('client dropped me')
		// clearInterval(interValID)
		res.end()
	})
})
