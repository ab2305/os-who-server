const _ = require('lodash')
const moment = require('moment')

module.exports.day = (count, requestYear, requestMonth) => {
	const month = requestMonth - 1
	let initialDay = false
	if (requestYear && requestMonth) {
		initialDay = moment().set({year: requestYear, month, date: 33, hour: 14, minute: 30, second: 0, millisecond: 0}).toDate()
	}
	let days
	if (initialDay) {
		days = Array.apply(null, Array(33)).map((o, index) => {
			const day = moment(initialDay).set({hour: 14, minute: 30, second: 0, millisecond: 0}).subtract(index, 'days').toDate()
			return {date: day}
		})
		days = _.filter(days, day => {
			return day.date < moment().set({year: requestYear, month: requestMonth, date: 1, hour: 14, minute: 30, second: 0, millisecond: 0}).toDate()
		})
	} else {
		days = Array.apply(null, Array(count)).map((o, index) => {
			const day = moment().set({hour: 14, minute: 30, second: 0, millisecond: 0}).subtract(index, 'days').toDate()
			return {date: day}
		})
	}

	return days
}

module.exports.month = (count, requestYear, requestMonth) => {
	const month = requestMonth - 1
	let monthDay
	monthDay = moment().set({date: 15, hour: 14, minute: 30, second: 0, millisecond: 0})
	if (requestYear && requestMonth) {
		monthDay = moment().set({year: requestYear, month, date: 15, hour: 14, minute: 30, second: 0, millisecond: 0})
	}

	const days = Array.apply(null, Array(count)).map((o, index) => {
		return {date: moment(monthDay).endOf('month').subtract(index, 'months').endOf('month').set({hour: 14, minute: 30, second: 0, millisecond: 0}).toDate()}
	})

	return days
}
