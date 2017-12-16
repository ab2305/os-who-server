/* eslint new-cap: 0 */

const express = require('express')

const router = express.Router()

function pong() {
	return new Promise(resolve => {
		return resolve('pong')
	})
}

router.get('/ping', async (req, res) => {
	const result = await pong()
	res.send(result)
})

module.exports = router
