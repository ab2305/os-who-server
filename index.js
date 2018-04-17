const {port} = require('config').app
const app = require('./app')

app.listen(port, 'api.nuguga.kr', () => {
	console.log(`Express server listening on port ${port}`)
})
