/* eslint new-cap: 0 */

const ioEvents = (io => {
	io.on('connection', (socket => {
		console.log('connected')
	}))

	io.on('disconnection', (socket => {
		console.log('connected')
	}))
})

const init = (app => {
	const server = require('http').Server(app)
	const io = require('socket.io')(server)

	// Force Socket.io to ONLY use "websockets" No Long Polling.
	io.set('transports', ['websocket'])

	// Define all Events
	ioEvents(io)

	// The server object will be then used to list to a port number
	return server
})

module.exports = init
