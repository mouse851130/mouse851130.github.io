import "./index.css";
import { name } from "@/utils";

console.log("client side main page", name);

// 3-1(3-2:main/index.html) 在main中透過使用者輸入名字與選擇房間的資料，把資料帶到聊天室的頁面，並展示相對應的內容
// 要怎麼拿:querystring
const nameInput = document.getElementById('nameInput') as HTMLInputElement
const roomSelect = document.getElementById('roomSelect') as HTMLSelectElement
const startBtn = document.getElementById('startBtn') as HTMLButtonElement

// 3-3 在btn加上事件監聽器
startBtn.addEventListener('click',()=>{
    const userName = nameInput.value
    const roomName = roomSelect.value
    console.log(userName,roomName)

    // 3-4(3-5:chatroom/index.ts) 跳轉到相對應的room:location.href
    // location.href是操作本頁面的位址
    location.href = `/chatRoom/chatRoom.html?user_name=${userName}&room_name=${roomName}`
})