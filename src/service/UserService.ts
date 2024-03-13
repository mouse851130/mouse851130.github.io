// 5-2 建立UserData類別
// type UserData = {
//     id : string
//     userName : string
//     roomName : string
// }
// 8-2-7(8-2-8:chatroom/index.ts) 將userData輸出
export type UserData = {
    id: string
    userName: string
    roomName: string
}

// 5-1 建立紀錄user資料的class，以便在後端操作
export default class UserSevice {
    // userMap 紀錄有多少個user
    // ts的map:儲存一個key跟一個value值，https://www.runoob.com/typescript/ts-map.html
    private userMap: Map<string, UserData>

    // 5-3 決定建立這個class時要做什麼事 
    constructor() {
        // 建立userMap，並記錄使用者的資訊
        this.userMap = new Map()
    }

    // 5-4(5-5:src/index.ts) 處理拿到的使用者的資料
    // Map.set，設置一個key&value
    // 新增使用者資料
    addUser(data: UserData) {
        this.userMap.set(data.id, data)
    }

    // 從聊天室移除使用者:判斷是不是有這個ID
    removeUser(id: string) {
        if (this.userMap.has(id)) {
            this.userMap.delete(id)
        }
    }

    // 讓外面的人拜訪使用者的資料
    getUser(id: string) {
        // if(this.userMap.has(id)){
        //     return this.userMap.get(id)
        // }
        // 可以看到getUser會有回傳一個undefined的結果，因為id可能沒有傳值，所以:
        if (!this.userMap.has(id)) return null
        const data = this.userMap.get(id)
        if (data) {
            return data
        }

        // 如果沒有該使用者，就回傳null
        return null
    }

    // 提供一個製作userData的api
    userDataInfoHandler(id: string, userName: string, roomName: string): UserData {
        return {
            id,
            userName,
            roomName
        }
    }

}