const connection = require('../models/').connection

connection.sync()
	.then(() => connection.close())
