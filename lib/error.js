class Response {
	constructor(status, body, logLevel, header) {
		this.status = status
		this.body = body
		this.header = header || {}
		this.isError = true
		this.logLevel = logLevel || null
	}
}

exports.BadRequest = class BadRequest extends Response {
	constructor(body, logLevel, header) {
		super(400, body, logLevel, header)
	}
}

exports.Unauthorized = class Unauthorized extends Response {
	constructor(body, logLevel, header) {
		super(401, body, logLevel, header)
	}
}

exports.NotFound = class NotFound extends Response {
	constructor(body, logLevel, header) {
		super(404, body, logLevel, header)
	}
}

exports.RequestTimeout = class RequestTimeout extends Response {
	constructor(body, logLevel, header) {
		super(408, body, logLevel, header)
	}
}

exports.Conflict = class Conflict extends Response {
	constructor(body, logLevel, header) {
		super(409, body, logLevel, header)
	}
}

exports.Gone = class Gone extends Response {
	constructor(body, logLevel, header) {
		super(410, body, logLevel, header)
	}
}

exports.UnprocessableEntity = class UnprocessableEntity extends Response {
	constructor(body, logLevel, header) {
		super(422, body, logLevel, header)
	}
}
