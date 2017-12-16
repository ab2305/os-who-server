const fcm = require('./lib/fcm')


return fcm.send(`user_4`, {
   notification: {
   title: `님이 누굴까를 설치하였습니다.`,
   body: `님이 누굴까를 설치하였습니다. 이제 마음껏 채팅을 해보세요.`,
   sound: null
},
data: {
   category: 'note'
                               }
                                       })
.then((s) => console.log(s))
.catch((err) => console.log('err' + err))
