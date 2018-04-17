const {port} = require('config').app
const app = require('./app')

app.listen(port, '0.0.0.0', () => {
	console.log(`Express server listening on port ${port}`)
})
