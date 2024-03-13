import "./index.css";
import { name } from "@/utils";
// 2-6(2-7:src/index.ts) 引入client端的socket.io
import { io } from 'socket.io-client'
console.log("client side chatroom page", name);
// 8-2-8 將userData引入
import { UserData } from '@/service/UserService'

// type UserMsg = { userData: UserData, msg: string }
type UserMsg = { userData: UserData, msg: string, time: number }

// 2-8 客戶端也要建立連結
const clientIo = io()

// 3-5 用url獲得querystring:location.href
// const url = new URL(location.href)
// console.log(url)
// const userName = url.searchParams.get('user_name')
// const roomName = url.searchParams.get('room_name')
// console.log(userName,roomName)
//或是
const url = new URLSearchParams(location.search)
const userName = url.get('user_name')
const roomName = url.get('room_name')
// console.log(url)
// console.log(url.getAll('user_name'))
// console.log(url.toString())


// 3-6(4-1:chatroom/index.html) 使用判斷式，沒有userName或roomName的無法進入房間，並跳轉回入口main
if (!userName || !roomName) {
    location.href = '/main/main.html'
}

// 6-1-1 (6-1-2 : src/index.ts) 建立使用者進入聊天室訊息
// clientIo.emit('join', `${userName}加入了聊天室`)

// 6-5-2 (6-5-3:src/index.ts) 將使用者名稱以及房間名稱傳送至後端
clientIo.emit('join', { userName, roomName })

// 4-2 拿到輸入框跟發送鈕，並下一個監聽器
const textInput = document.getElementById('textInput') as HTMLInputElement
const submitBtn = document.getElementById('submitBtn') as HTMLButtonElement
// submitBtn後會有一個問號，因為ts判斷這可能會式HTMLElement或null，所以要斷言
submitBtn.addEventListener('click', () => {
    const textValue = textInput.value
    // console.log(textValue)

    // 4-3(4-4:src/index.ts) 把文字內容推送到後端
    if(textValue){
      clientIo.emit('chat', textValue)
    }
    
})

// 4-8-2(4-9 : chatroom/index.html) 用拿到的roomName去填入聊天室上方的roomName
const headerRoomName = document.getElementById('headerRoomName') as HTMLParagraphElement
headerRoomName.innerText = roomName || ''

// 8-2-3 宣告一個變數將socketid儲存起來
let userID = ''

// 4-9-2 對back按鈕進行操作
const backBtn = document.getElementById('backBtn') as HTMLButtonElement
backBtn.addEventListener('click', () => {
    location.href = '/main/main.html'
})
// 5-1 建立user的類別:在src新增一個service的資料夾，並建立UserService.ts

// 4-6 處理從後端拿回來的聊天訊息，並呈現一個新的訊息
// 4-6-1 建立一個新增訊息的涵式
// 4-6-2 至chatroom/index.html把左邊的聊天訊息註解掉，並複製右邊的聊天訊息，以及把整個對話框的div加上一個id
const chatBoard = document.getElementById('chatBoard') as HTMLDivElement

// function msgHandler(msg: string) {
//     // 4-6-3 新增一個div，並把class填上去，最後再寫入裡面的對話內容
//     const divBox = document.createElement('div')
//     divBox.classList.add('flex', 'justify-end', 'mb-4', 'items-end')
//     divBox.innerHTML = `
//     <p class="text-xs text-gray-700 mr-4">00:00</p>

//     <div>
//       <p class="text-xs text-white mb-1 text-right">Test</p>
//       <p
//         class="mx-w-[50%] break-all bg-white px-4 py-2 rounded-bl-full rounded-br-full rounded-tl-full"
//       >
//         ${msg}
//       </p>
//         </div>`

//     // 4-6-4 把完成的新的對話框加到html裡面
//     chatBoard.appendChild(divBox)

//     // 4-7(4-8: chatroom/index.html) 把輸入框內容清除並自動scroll到最下方
//     textInput.value = ''
//     // https://blog.csdn.net/m0_45067620/article/details/123604617
//     chatBoard.scrollTop = chatBoard.scrollHeight
// }

console.log('')

// 8-2-10 改寫傳送訊息的涵式，讓其以userName以及userID去判斷訊息該放左右
function msgHandler(data: UserMsg) {

    console.log(data.time)
    // 8-3-3 建立date物件
    const date = new Date(data.time)
    const time = `${date.getHours()}:${date.getMinutes()}`

    const divBox = document.createElement('div')
    divBox.classList.add('flex', 'mb-4', 'items-end')

    // 8-2-11 判斷傳送訊息時，伺服器給的id是不是跟一開始connection時的id一樣
    if (data.userData.id === userID) {
        divBox.classList.add('justify-end')
        divBox.innerHTML = `
        <p class="text-xs text-gray-700 mr-4">${time}</p>
    
        <div>
          <p class="text-xs text-white mb-1 text-right">${data.userData.userName}</p>
          <p
            class="mx-w-[50%] break-all bg-white px-4 py-2 rounded-bl-full rounded-br-full rounded-tl-full"
          >
            ${data.msg}
          </p>
            </div>`
    } else {
        // 8-2-12(8-3:src/index.ts) 別人的訊息(從chatroom/index.html copy過來)
        divBox.classList.add('justify-start')
        divBox.innerHTML = `

        <div>
          <p class="text-xs text-gray-700 mb-1">${data.userData.userName}</p>
          <p
            class="mx-w-[50%] break-all bg-gray-800 px-4 py-2 rounded-tr-full rounded-br-full rounded-tl-full text-white"
          >
            ${data.msg}
          </p>
        </div>
        <p class="text-xs text-gray-700 ml-4">${time}</p>
      `
    }

    // 4-6-4 把完成的新的對話框加到html裡面
    chatBoard.appendChild(divBox)

    // 4-7(4-8: chatroom/index.html) 把輸入框內容清除並自動scroll到最下方
    textInput.value = ''
    // https://blog.csdn.net/m0_45067620/article/details/123604617
    chatBoard.scrollTop = chatBoard.scrollHeight
}

// 6-3-1 寫使用者加入聊天室的涵式
function roomMsgHandler(msg: string) {
    const divBox = document.createElement('div')
    divBox.classList.add('flex', 'justify-center', 'mb-4', 'items-center')
    divBox.innerHTML = `<p class="text-gray-700 text-sm">${msg}</p>`

    // 新增完訊息就貼到聊天室
    chatBoard.append(divBox)
    chatBoard.scrollTop = chatBoard.scrollHeight

}

// 2-9(3-1:main/index.ts) 建立連線成功後，回傳訊息給後端
// 這裡同時也是6-1-3(6-2:chatroom/index.html) 顯示成功加入聊天室的訊息
clientIo.on('join', (msg) => {
    // 這個msg參數就是後端emit join事件時帶來的args參數'welcome'
    console.log(msg)
    // console.log('clientIo.id:',clientIo.id)

    // 6-3-2(6-4:src/index.ts) 運行新加入聊天室的涵式
    roomMsgHandler(msg) // 此時可以試多個使用者進入聊天室的情況

})

// clientIo.on('test',(msg)=>{
//     console.log('testMsg:', msg)
// })

// 4-5 收到從後端收到的聊天訊息
// clientIo.on('chat', (msg) => {
//     console.log('from backend:', msg);

//     // 4-6-5 執行新增涵式
//     msgHandler(msg)
// })
// 8-2-6(8-2-7:service/UserService) 從前端也放一個userData的class，方便接收後端傳過來的userData
clientIo.on('chat', (data: UserMsg) => {
    // 8-2-9(上方:data以UserData的形式進行，並改造Msg的function)(最上方有新定義一個UserMsg)
    msgHandler(data)

    // 4-6-5 執行新增涵式
    // msgHandler(msg)
})


// 6-4-2(6-5:src/index.ts) 前端接收有人disconnect的消息
clientIo.on('leave', (msg) => {
    roomMsgHandler(msg)

    // 此時可以看到有人離開聊天室的訊息，但到目前為止都只是後端發送訊息到前端而已，所以要在使用者加入聊天室時就把訊息丟給後端
})

// 8-2-2 取得socket.id
clientIo.on('userID', (id) => {
    // 8-2-4(8-2-5:src/index.ts)
    userID = id
})