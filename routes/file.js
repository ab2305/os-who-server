/* eslint new-cap: 0 */

const path = require('path')
const express = require('express')
const multer = require('multer')
const File = require('../models').File
const uploadDir = require('../lib/upload-dir')

const upload = multer({dest: uploadDir()})
const bannedExts = ['.html', '.js', '.css']

const router = express.Router()

router.post('/file', upload.single('file'), async (req, res, next) => {
	if (!req.file) {
		return res.status(400).send('No file')
	}

	const ext = path.extname(req.file.originalname)
	if (bannedExts.indexOf(ext) >= 0) {
		return res.status(400).send('Ext not allowed')
	}

	let file

	try {
		file = await File.upload(req.file)
	} catch (err) {
		return next(err)
	}

	return res.json(file.toRes()).end()
})

module.exports = router
