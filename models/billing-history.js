/* eslint new-cap: 0 */

const _ = require('lodash')
const Sequelize = require('sequelize')
const billingConfig = require('config').billing

module.exports = (defineModel, defineRelationship, models) => {
	defineModel('BillingHistory', {
		id: {type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true},
		productId: {type: Sequelize.STRING},
		refunded: {type: Sequelize.BOOLEAN, defaultValue: false},
		refundedAt: {type: Sequelize.DATE},
		category: {type: Sequelize.ENUM('stamp', 'subscription'), allowNull: false},
		price: {type: Sequelize.STRING},
		orderId: {type: Sequelize.TEXT},
		refundMemo: {type: Sequelize.TEXT},
		memo: {type: Sequelize.TEXT},
		purchaseToken: {type: Sequelize.TEXT},
		purchaseTime: {type: Sequelize.TEXT},
		purchaseState: {type: Sequelize.TEXT},
		receiptSignature: {type: Sequelize.TEXT},
		receiptData: {type: Sequelize.TEXT},
		developerPayload: {type: Sequelize.TEXT},
		productName: {type: Sequelize.VIRTUAL, get() {
			switch (this.productId) {
				case billingConfig.stamp33:
					return '33매'
				case billingConfig.stamp100:
					return '105매'
				case billingConfig.stamp200:
					return '220매'
				case billingConfig.stamp500:
					return '600매'
				case billingConfig.stamp1000:
					return '1300매'
				case billingConfig.subscription30:
					return '구독권 30일권'
				case billingConfig.subscription60:
					return '구독권 60일권'
				case billingConfig.subscription90:
					return '구독권 90일권'
				case billingConfig.subscription180:
					return '구독권 180일권'
				case billingConfig.stamp_33:
					return '33매'
				case billingConfig.stamp_100:
					return '105매'
				case billingConfig.stamp_200:
					return '220매'
				case billingConfig.stamp_500:
					return '600매'
				case billingConfig.stamp_1000:
					return '1300매'
				case billingConfig.stest_30:
					return '구독권 30일권'
				case billingConfig.stest_60:
					return '구독권 60일권'
				case billingConfig.stest_90:
					return '구독권 90일권'
				case billingConfig.stest_180:
					return '구독권 180일권'
				default:
					return null
			}
		}}
	}, {

		instanceMethods: {
			toRes() {
				return _.chain(this.toJSON())
				.extend({
					user: (this.user) ? this.user.toRes() : null
				})
				.value()
			}
		}
	})

	defineRelationship(() => {
		models.BillingHistory.belongsTo(models.User, {as: 'user', foreignKey: {name: 'userId', allowNull: false}, onDelete: 'CASCADE'})
	})
}
