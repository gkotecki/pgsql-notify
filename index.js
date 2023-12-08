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
	res.flushHeaders()

	const sco = await db.connect()

	sco.client.on('notification', (data) => {
		console.log('Received:', data)
		res.write(`data: ${JSON.stringify(data)}\n\n`)
	})

	sco.none('LISTEN "records-changes"')

	res.on('close', () => {
		console.log('Connection dropped')
		res.end()
	})
})

app.post('/add', async (req, res) => {
  const sco = await db.connect()
  await sco.none(`INSERT INTO records (value) VALUES ('new record')`)
  sco.done()
  res.send('OK')
})
