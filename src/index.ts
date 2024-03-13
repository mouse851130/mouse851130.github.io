import devServer from "./server/dev";
import prodServer from "./server/prod";
import express from "express";
import { name } from "@/utils";
// 5-5 引入UserService
import UserService from '@/service/UserService'

// 2-1 先安裝socket.io
import { Server } from 'socket.io'
// 2-2 改造http連線，讓其成為socket的連線
import https from 'http'

// 8-3-1 顯示訊息傳送時間:使用moment套件(npm i -D moment)
import moment from 'moment'


// 5-6(6-1 : chatroom/index.ts) 建立userService的物件
const userService = new UserService()

const port = 3000;
const app = express();
// 2-3 透過http 建立server，在建立socket.io時會用到的server
// 參考: With Express -> https://socket.io/docs/v4/server-initialization/
const server = https.createServer(app)
// 2-4 建立socket server
const io = new Server(server)
// 2-7(2-8:chatroom/index.ts) 在client端建立連接時發起通知:io.on，並發給用戶一個訊息:emit
// connection是保留字，參見:https://socket.io/docs/v4/server-initialization/
// callback涵式會帶一個實體，中間帶的參數就是socket
// A Socket is the fundamental class for interacting with the client.
io.on('connection', (socket) => {
  socket.emit('join', 'welcome')  // (event, args(參數))
  // 備註:socket.id : Each new connection is assigned a random 20-characters identifier.
  // 代表每個socket都有一個獨特的id
  // console.log(socket.id)

  // socket.emit('test',{name:'alex', age:12})

  // 8-2-1(8-2-2:chatroom/index.ts) 將聊天訊息區分開來:自己的在右邊，別人的在左邊:
  // 在進行connection時就把socket.id傳到前端
  socket.emit('userID', socket.id)

  // 4-4(4-5:chatroom/index.ts) 從後端接收前端發來的聊天訊息，並發送回前端
  // p.s. 雖然都寫成是chat，但實際上兩者是不同的東西
  socket.on('chat', (msg) => {
    console.log('server :', msg)    // 註:server的log會展示在terminal
    // io.emit('chat', msg) // 用socket.emit也可以

    // 8-1 將聊天訊息區分:不同聊天室的訊息會分隔開來
    const userData = userService.getUser(socket.id)
    // if (userData) {
    //   這邊直接用to，不是用broadcast是因為自己也要看到聊天訊息(broadcast只有別人看的到)
    //   io.to(userData.roomName).emit('chat' , msg)

    //   8-2-5(8-2-6:chatroom/index.ts) 除了聊天訊息，也將包含有使用者名稱的userData傳到前端，讓訊息在送出時可以判斷
    //   io.to(userData.roomName).emit('chat', { userData, msg })
    // }

    // 8-3-2(8-3-3:chatroom/index.ts) 建立時間變數
    const time = moment.utc()
    if (userData) {
      io.to(userData.roomName).emit('chat', { userData, msg, time })
    }
  })

  // 6-1-2(6-1-3 : chatroom/index.ts) 接收前端發回來的訊息
  // socket.on('join', (msg) => {
  //   io.emit('join', msg)

  // })

  // 6-5-1(6-5-2:chatroom/index.ts) 使用者進入聊天室後，便用UserData將使用者資訊儲存起來
  socket.on('join', ({ userName, roomName }: { userName: string, roomName: string }) => {
    // 6-5-2(改動上面) 用解構的方式將userName以及roomName取出
    const userData = userService.userDataInfoHandler(
      socket.id,
      userName,
      roomName = roomName
    )

    // io.emit('join', msg)

    // 6-5-3 將userData用addUser的方式新增，這時候這名使用者的資料就會存在於Map裡面
    userService.addUser(userData)

    // 6-5-4 將訊息發送回前端
    // io.emit('join', `${userName} 加入了 ${roomName}`)


    // 7-1 讓使用者在加入不同房間時能做出區別:socket的join功能 -> 用roomName當空間名字
    socket.join(userData.roomName)
    // 此時再用socket的broadcast功能去傳送特定訊息到特定房間
    socket.broadcast.to(userData.roomName).emit('join', `${userName} 加入了 ${roomName}`)

  })

  // 6-4-1(6-4-2:chatroom/index.ts) 因為現在加入不同room還是可以看到別人加入不同聊天室的訊息，所以要做處理:
  // 先做離開聊天室的處理:disconnect
  //   socket.on('disconnect', () => {
  //     io.emit('leave', '有用戶離開聊天室')
  //   })

  // })

  // 6-6 現在拿到使用者資料了，就可以客製化離開訊息
  socket.on('disconnect', () => {
    // 先取得是哪個使用者
    const userData = userService.getUser(socket.id)  // 拿到使用者的userData
    const userName = userData?.userName
    // 記得看6-6時將以下註解拿掉
    // if (userName) {
    //   io.emit('leave', `${userData.userName}離開了聊天室`)
    // }

    // 7-2(8-1:src/index.ts) 在disconnect時也可以僅對特定頻道發送訊息
    if (userName) {
      socket.broadcast.to(userData.roomName).emit('leave', `${userData.userName}離開了聊天室`)
    }

    // 6-7(7-1:src/index.ts) 使用者離開後便刪除使用者資訊
    userService.removeUser(socket.id)

  })

})

// 執行npm run dev本地開發 or 執行npm run start部署後啟動線上伺服器
if (process.env.NODE_ENV === "development") {
  devServer(app);
} else {
  prodServer(app);
}

// console.log("server side", name);

// 2-5(2-6在chatroom/index.ts)，將app.listen改為server.listen
// app.listen(port, () => {
//   console.log(`The application is running on port ${port}.`);
// });

server.listen(port, () => {
  console.log(`The application is running on port ${port}.`);
});