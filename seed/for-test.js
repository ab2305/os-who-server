const BillingHistory = require('../models/').BillingHistory
const Chat = require('../models/').Chat
const User = require('../models/').User
const Invitee = require('../models/').Invitee
const Item = require('../models/').Item
const Message = require('../models/').Message
const UserInvitee = require('../models/').UserInvitee
const UsingHistory = require('../models/').UsingHistory

async function insert() {
	const user = await User.create({
		email: 'a@a.a',
		password: 'aaaa',
		name: 'A',
		nickname: 'A nickname',
		gender: 'male',
		birthYear: '1997',
		phone: '01011111111'
	})

	await user.setPassword('aaaa')

	await Item.create({
		stamp: 68,
		userId: user.id
	})

	await BillingHistory.create({
		productId: 'test_30',
		price: '900',
		orderId: 'orderId',
		category: 'stamp',
		purchaseToken: 'purchaseToken',
		purchaseTime: 'purchaseTime',
		purchaseState: 'purchaseState',
		receiptSignature: 'receiptSignature',
		receiptData: 'receiptData',
		developerPayload: 'developerPayload',
		userId: user.id
	})

	await BillingHistory.create({
		productId: 'test_30',
		price: '900',
		orderId: 'orderId',
		category: 'stamp',
		purchaseToken: 'purchaseToken',
		purchaseTime: 'purchaseTime',
		purchaseState: 'purchaseState',
		receiptSignature: 'receiptSignature',
		receiptData: 'receiptData',
		developerPayload: 'developerPayload',
		userId: user.id
	})

	const invitee1 = await Invitee.create({
		name: 'John',
		phone: '01088888888',
		code: '0000'
	})

	const userInvitee1 = await UserInvitee.create({
		name: 'John',
		userId: user.id,
		inviteeId: invitee1.id
	})

	const chat1 = await Chat.create({
		topic: `${user.id}-${invitee1.phone}`,
		userId: user.id,
		inviteeId: invitee1.id
	})

	await Message.create({
		text: '안녕? 내가 누굴까?',
		chatId: chat1.id,
		userId: user.id
	})

	await Message.create({
		text: '혹시 전남친?',
		chatId: chat1.id,
		inviteeId: invitee1.id
	})

	await Message.create({
		text: '아직도 전남친에 미련이 있는거야??',
		chatId: chat1.id,
		userId: user.id
	})

	await Message.create({text: '너 누구야?', chatId: chat1.id, inviteeId: invitee1.id})

	await Message.create({text: '야', chatId: chat1.id, inviteeId: invitee1.id})

	await Message.create({text: '대답안해?', chatId: chat1.id, inviteeId: invitee1.id})

	await Message.create({text: '쫄리냐?', chatId: chat1.id, inviteeId: invitee1.id})

	await Message.create({text: '쫄리면 뒈지시던가', chatId: chat1.id, inviteeId: invitee1.id})

	await Message.create({text: '꼭 피를 봐야겠어?', chatId: chat1.id, inviteeId: invitee1.id})

	await Message.create({text: '어플 삭제했냐?', chatId: chat1.id, inviteeId: invitee1.id})

	await Message.create({text: '니 누구냐고', chatId: chat1.id, inviteeId: invitee1.id})

	await Message.create({text: '익명으로 설치면 좋냐?', chatId: chat1.id, inviteeId: invitee1.id})

	await Message.create({text: '대답 안하냐?', chatId: chat1.id, inviteeId: invitee1.id})

	await Message.create({text: '보고 있는거 다 안다', chatId: chat1.id, inviteeId: invitee1.id})

	await Message.create({text: '니 덕민이냐?', chatId: chat1.id, inviteeId: invitee1.id})

	await Message.create({text: '내한테 미련있나?', chatId: chat1.id, inviteeId: invitee1.id})

	await Message.create({text: '마', chatId: chat1.id, inviteeId: invitee1.id})

	await Message.create({text: '니 자신 있나', chatId: chat1.id, inviteeId: invitee1.id})

	await Message.create({text: '내 부싼여자대이', chatId: chat1.id, inviteeId: invitee1.id})

	await Message.create({text: '니 자신 있나??', chatId: chat1.id, inviteeId: invitee1.id})

	await Message.create({text: '내 승질 억수로 드럽데이', chatId: chat1.id, inviteeId: invitee1.id})

	await Message.create({text: '푸싼 아이가?', chatId: chat1.id, inviteeId: invitee1.id})

	await UsingHistory.create({
		usedStamp: 1,
		userId: user.id,
		userInviteeId: userInvitee1.id
	})

	const invitee2 = await Invitee.create({
		name: 'Ahn',
		phone: '01077777777',
		code: '0000'
	})

	const userInvitee2 = await UserInvitee.create({
		name: 'Ahn',
		userId: user.id,
		inviteeId: invitee2.id
	})

	const chat2 = await Chat.create({
		topic: `${user.id}-${invitee2.phone}`,
		userId: user.id,
		inviteeId: invitee2.id
	})

	await Message.create({
		text: '내가 과연 누굴까?',
		chatId: chat2.id,
		userId: user.id
	})

	await Message.create({
		text: '뭐 나 좋아하는 애들 중 하나겠지? ㅋㅋ',
		chatId: chat2.id,
		inviteeId: invitee2.id
	})

	await Message.create({
		text: '흠.. 인기 많아서 좋겠다',
		chatId: chat2.id,
		userId: user.id
	})

	await UsingHistory.create({
		usedStamp: 1,
		userId: user.id,
		userInviteeId: userInvitee2.id
	})
}

insert()
