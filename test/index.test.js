const { default: axios } = require("axios");
const { response } = require("express");

function sum(a, b) {
    return a + b
}



// describe("Authentication", () => {
//     test("add 1 + 2 to equal to 3", ()=> {
//         let ans = sum(1, 2)
//         expect(ans).toBe(3)
//     })
    
    
//     test("add 1 + 2 to equal to 3", ()=> {
//         let ans = sum(-1, -2)
//         expect(ans).not.toBe(3)
//     })
// } )


const BACKEND_URL = "http://localhost:3000"
const WS_URL = "ws://localhost:3001"

describe("Authentication",  () => {
    test("User is able to signup", async ()=> {
    const username = "Yash" + Math.random();
    const password = "123456"

    const response = await axios.post(`${BACKEND_URL}/api/v1/sigup`, {
        username,
        password,
        type: "admin"
    })

    expect(response.statusCode).toBe(200)



    const updatedResponse = await axios.post(`${BACKEND_URL}/api/v1/sigup`, {
        username,
        password,
        type: "admin"
    })

    expect(updatedResponse.statusCode).toBe(400)

    })

    
    test("User request failed if the usernsme is empty" , async () => {
        const username = `yash-${Math.random()}`
        const password = "123456"

        const response =  await axios.post(`${BACKEND_URL}/api/v1/signup`, {
            
            password,
            type: "admin"
        })

        expect(response.statusCode).toBe(400)
    })

    test("sigin successed if the username and password are correct",  async () => {
        const username = `yash-${Math.random()}`
        const password = "123456"
        
        const response  =  await axios.post(`${BACKEND_URL}/api/av1/sigin`, {
            username,
            password
        })

        expect(response.statusCode).toBe(200)
        expect(response.body.token).toBeDefined()
    })

    test("sigin failed is the password is incorrect",  async () => {
        const username = `yash-${Math.random()}`
        const password = "123456"

        await axios.post(`${BACKEND_URL}/api/av1/signup`, {
            username,
            password: "12334"
        })
        
        const response  =  await axios.post(`${BACKEND_URL}/api/av1/sigin`, {
            username,
            password: "12334"
        })

        expect(response.statusCode).toBe(403)
    })
    
} )


describe("User metadata Endpoints",  () => {

    let token = ""
    let avatarId = ""

    beforeAll(async () => {
        const username = `yash-${Math.random()}`
        const password = "123456"

        await axios.post(`${BACKEND_URL}/api/v1/signup`, {
            username,
            password,
            type: "admin"
        })
        const response = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
            username,
            password
        })

        token =response.data.token

        const avatarResponse = await axios.post(`${BACKEND_URL}/api/v1/avatar`, {
            "imageURL": "",
            "name": ""
        })
        avatarId= avatarResponse.data.avatarId
    })

   

    test("User cant update their metadata with a wrong metadata id", async () => {
        const response = await axios.post(`${BACKEND_URL}/api/v1/user/metadata`, {
            avatarId: "12345678"
        },{
            headers: {
                "Authorization" : `bearer ${token}`
            }
        })
        expect(response.statusCode).toBe(400 )
    })

    test("User can update their metadata with the right avatar id", async () => {
        const response = await axios.post(`${BACKEND_URL}/api/v1/user/metadata`, {
            avatarId
        },{
            headers: {
                "Authorization" : `bearer ${token}`
            }
        })
        expect(response.statusCode).toBe(200 )
    })

    test("User is not able to uodate their metadta if the auth header is not present", async () => {
        const response = await axios.post(`${BACKEND_URL}/api/v1/user/metadata`, {
            avatarId
        })
        expect(response.statusCode).toBe(403)
    })
})


describe("user avatar information", () => {
    let avatarId
    let token
    let userID

    beforeAll(async () => {
        const username = `yash-${Math.random()}`
        const password = "123456"

        const signupResponse = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
            username,
            password,
            type: "admin"
        })

        userID = signupResponse.data.userID
        const response = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
            username,
            password
        })

        token =response.data.token

        const avatarResponse = await axios.post(`${BACKEND_URL}/api/v1/avatar`, {
            "imageURL": "",
            "name": ""
        })
        avatarId= avatarResponse.data.avatarId
    }, {
        headers:{
            "Authorization": `Bearer ${token}`
        }
    }) 


    test("get back avatar informatiom from the user", async () => {
        const response = await axios.get(`${BACKEND_URL}/api/v1/user/metadata/bulk?ids=[${userID}]`)
        expect(response.data.avatars[0].userID).toBe(userID)
        expect(response.data.avatars.length).toBe(1)
    })

    test("Available avatar listed the recently created avatar", async () => {
        const response = await axios.post(`${BACKEND_URL}/api/v1/avatars`)
        expect(response.data.avatars.length).not.toBe(0)
        const currentAvatar = response.data.avatars.find(x => x.id == avatarId)
        expect(currentAvatar).toBedefined()
    })


})



describe("Space information", () => {
    let mapId
    let element1Id
    let element2Id
    let adminToken
    let adminId
    let userToken
    let userId

    beforeAll(async () => {
        const username = `yash-${Math.random()}`
        const password = "123456"

        const signupResponse = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
            username,
            password,
            type: "admin"
        })



        adminId = signupResponse.data.userID
        const response = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
            username,
            password
        })

        adminToken = response.data.token


        const userSignupResponse = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
            username: username + "-user",
            password,
            type: "user"
        })



        userId = userSignupResponse.data.userID
        const userResponse = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
            username: username + "-user",
            password
        })

        userToken  = userResponse.data.token


        const element1Response = axios.post(`${BACKEND_URL}/api/v1/admin/element`, {

            "imageUrl":"",
            "width" : 1,
            "height" : 1,
            "static" : true
        }, {
            headers:{
                "Authorization": `Bearer ${adminToken}`
            }
        })


        const element2Response = axios.post(`${BACKEND_URL}/api/v1/admin/element`, {

            "imageUrl":"",
            "width" : 1,
            "height" : 1,
            "static" : true
        }, {
            headers:{
                "Authorization": `Bearer ${adminToken}`
            }
        })
        element1Id = element1Response.data.id
        element2Id = element2Response.data.id

        const mapResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/map`,{
            "thumbnail": "https://thumbnail.com/a.png",
            "dimensions": "100x200",
            "defaultElements":[
            {
                elementId: element1Id,
                x: 20,
                y: 20,
            },
            {
                elementId: element1Id,
                x: 18,
                y: 20,
            },
            {
                elementId: element2Id,
                x: 19,
                y: 20,
            },
        ]
        },{
            headers:{
                "Authorization": `Bearer ${adminToken}`
                }
        })

        mapId = mapResponse.id
    })

    test("User is able to create a space ", async () => {
        const response = await axios.post(`${BACKEND_URL}/api/v1/space`, {
            "name" : "Test",
            "dimensions" : "100x200",
            "mapId" : mapId
        }, {
            headers:{
                authorization: `Bearer ${userToken}`
            }
        })


        expect(response.data.spaceId).toBeDefined()
    })


    test("User is able to create a space without mapId(Empty Space)", async () => {
        const response = await axios.post(`${BACKEND_URL}/api/v1/space`, {
            "name" : "Test",
            "dimensions" : "100x200",
            
        }, {
            headers:{
                authorization: `Bearer ${userToken}`
            }
        })


        expect(response.data.spaceId).toBeDefined()
    })


    test("User is not able to create a space without mapId and dimensions", async () => {
        const response = await axios.post(`${BACKEND_URL}/api/v1/space`, {
            "name" : "Test"
        }, {
            headers:{
                authorization: `Bearer ${userToken}`
            }
        })


        expect(response.statusCode).toBe(400)
    })



    test("User should not able to delete (the randam space) the psace that does'not exist ", async () => {
        const response = await axios.delete(`${BACKEND_URL}/api/v1/space/randomIdDoesNotExist`)


        expect(response.statusCode).toBe(400)
    }, {
        headers:{
            authorization: `Bearer ${userToken}`
        }
    })

    test("User should able to delete a space that does exist", async () => {
        const response = await axios.delete(`${BACKEND_URL}/api/v1/space/randomIdDoesNotExist` , {
            "name" : "Test",
            "dimensions" : "100x200",
            
        }, {
            headers:{
                authorization: `Bearer ${userToken}`
            }
        })

        const deleteResponse = await axios.delete(`${BACKEND_URL}/api/v1/space/${response.data.spaceId  }`, {
            headers:{
                authorization: `Bearer ${userToken}`
            }
        })


        expect(deleteResponse.statusCode).toBe(200)
    })


    test("user not able to delete someone else space that was create why another user ", async () => {
        const response = await axios.delete(`${BACKEND_URL}/api/v1/space/randomIdDoesNotExist` , {
            "name" : "Test",
            "dimensions" : "100x200",
            
        }, {
            headers:{
                authorization: `Bearer ${userToken}`
            }
        })

        const deleteResponse = await axios.delete(`${BACKEND_URL}/api/v1/space/${response.data.spaceId  }`, {
            headers:{
                authorization: `Bearer ${adminToken}`
            }
        })


        expect(deleteResponse.statusCode).toBe(400)
    })


    test("Admin has no spaces initally", async () => {
        const response = await axios.get(`${BACKEND_URL}/api/v1/space/all`)
        expect (response.data.spaces.length).toBe(0)
    },{
        headers: {
            authorization: `Bearer ${userToken}`
        }
    })
    test("Admin has no spaces initally", async () => {
        const spaceCreateResponse = await axios.post(`${BACKEND_URL}/api/v1/space/all`,{
            "name":"Test",
            "dimensions": "100x200",
        },{
            headers: {
                authorization: `Bearer ${userToken}`
            }
        })
        const response = await axios.get(`${BACKEND_URL}/api/v1/space/all`,{
            headers: {
                authorization: `Bearer ${userToken}`
            }
        })
        const filteredSpace = response.data.spaces.find(x => x.id == spaceCreateResponse.spaceId)
        expect (response.data.spaces.length).toBe(1)
        expect (filteredSpace).toBeDefined(1)

    })



})


describe("Arena endpoints" ,  () => {
    let mapId
    let element1Id
    let element2Id
    let adminToken
    let adminId
    let userToken
    let userId
    let spaceId

    beforeAll(async () => {
        const username = `yash-${Math.random()}`
        const password = "123456"

        const signupResponse = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
            username,
            password,
            type: "admin"
        })



        adminId = signupResponse.data.userID
        const response = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
            username: username,
            password
        })

        adminToken = response.data.token


        const userSignupResponse = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
            username: username + "-user",
            password,
            type: "user"
        })



        userId = userSignupResponse.data.userID
        const userResponse = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
            username: username + "-user",
            password
        })

        userToken  = userResponse.data.token


        const element1Response = axios.post(`${BACKEND_URL}/api/v1/admin/element`, {

            "imageUrl":"",
            "width" : 1,
            "height" : 1,
            "static" : true
        }, {
            headers:{
                "Authorization": `Bearer ${adminToken}`
            }
        })


        const element2Response = axios.post(`${BACKEND_URL}/api/v1/admin/element`, {

            "imageUrl":"",
            "width" : 1,
            "height" : 1,
            "static" : true
        }, {
            headers:{
                "Authorization": `Bearer ${adminToken}`
            }
        })
        element1Id = element1Response.data.id
        element2Id = element2Response.data.id

        const mapResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/map`,{
            "thumbnail": "https://thumbnail.com/a.png",
            "dimensions": "100x200",
            "defaultElements":[
            {
                elementId: element1Id,
                x: 20,
                y: 20,
            },
            {
                elementId: element1Id,
                x: 18,
                y: 20,
            },
            {
                elementId: element2Id,
                x: 19,
                y: 20,
            },
        ]
        },{
            headers:{
                "Authorization": `Bearer ${adminToken}`
                }
        })

        mapId = mapResponse.id

        const spaceResponse = await axios.post(`${BACKEND_URL}/api/v1/`, {
            "name": "test",
            "dimension" : "100x200",
            "mapId": mapId
        },{
            headers: {
                "Authorization": `Bearer ${userToken}`
            }
        })

        spaceId = spaceResponse.data.spaceId
    })

    test("incorrect spaceId return a 400", async () => {
        const response = axios.get(`${BACKEND_URL}/api/v1/space/123kasdk01`, {
            headers: {
                "Authorization": `Bearer ${userToken}`
            }
        })
        expect (response.statusCode).toBe(400)
    })

    test(" Correct spaceId return all the elements", async () => {
        const response = axios.get(`${BACKEND_URL}/api/v1/space/${spaceId}`, {
            headers: {
                "Authorization": `Bearer ${userToken}`
            }
        })
        expect(response.data.dimensions).toBe("100x200")
        expect(response.data.elements.length).toBe(3)
    })

    test("Delete endpoint is able to delete an elements", async () => {
        const response = axios.delete(`${BACKEND_URL}/api/v1/space/element`, {
            headers: {
                "Authorization": `Bearer ${userToken}`
            }
        })
        axios.delete(`${BACKEND_URL}/api/v1/space/element`, {
            spaceId: spaceId,
            elementId: response.data.elements[0].id
        }, {
            headers: {
                "Authorization": `Bearer ${userToken}`
            }
        })

        const newResponse = await axios.get(`${BACKEND_URL}/api/v1/space/${spaceId}`, {
            headers: {
                "Authorization": `Bearer ${userToken}`
            }
        })
        expect(newResponse.data.elements.length).toBe(2)
    })

    test("Adding the eleme ts failed if the element lies outside the dimension", async () => {
        axios.post(`${BACKEND_URL}/api/v1/space/element`, {
            "elementId" : element1Id,
            "spaceId" : spaceId,
            "x" : 500000,
            "y" : 2000000
        }, {
            headers: {
                "Authorization": `Bearer ${userToken}`
            }
        })

        const newResponse = await axios.get(`${BACKEND_URL}/api/v1/space/${spaceId}`, {
            headers: {
                "Authorization": `Bearer ${userToken}`
            }
        })
        expect(newResponse.statusCode).toBe(404)
    })

    test("Adding endpoint is able to add an elements", async () => {
        axios.post(`${BACKEND_URL}/api/v1/space/element`, {
            "elementId" : element1Id,
            "spaceId" : spaceId,
            "x" : 50,
            "y" : 20
        }, {
            headers: {
                "Authorization": `Bearer ${userToken}`
            }
        })

        const newResponse = await axios.get(`${BACKEND_URL}/api/v1/space/${spaceId}`, {
            headers: {
                "Authorization": `Bearer ${userToken}`
            }
        })
        expect(newResponse.data.elements.length).toBe(3)
    })
})




describe("Admin Endpoints", () => {

    let adminToken
    let adminId
    let userToken
    let userId

    beforeAll(async () => {
        const username = `yash-${Math.random()}`
        const password = "123456"

        const signupResponse = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
            username,
            password,
            type: "admin"
        })



        adminId = signupResponse.data.userID
        const response = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
            username: username,
            password
        })

        adminToken = response.data.token


        const userSignupResponse = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
            username: username + "-user",
            password,
            type: "user"
        })



        userId = userSignupResponse.data.userID
        const userResponse = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
            username: username + "-user",
            password
        })

        userToken  = userResponse.data.token


        
    })

    test("User is not able to hit endpoints ", async () => {
        

        const elementResponse = axios.post(`${BACKEND_URL}/api/v1/admin/element`, {

            "imageUrl":"",
            "width" : 1,
            "height" : 1,
            "static" : true
        }, {
            headers:{
                "Authorization": `Bearer ${userToken}`
            }
        })

        

        const mapResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/map`,{
            "thumbnail": "https://thumbnail.com/a.png",
            "dimensions": "100x200",
            "defaultElements":[]
        },{
            headers:{
                "Authorization": `Bearer ${userToken}`
                }
        })

        const avatarResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/avatar`,{
            "imageurl": "https://thumbnail.com/a.png",
            "name" : "Timmy",
            "defaultElements":[]
        },{
            headers:{
                "Authorization": `Bearer ${userToken}`
                }
        })

        const updatElementResponse = await axios.put(`${BACKEND_URL}/api/v1/admin/element/123`,{
            "imageurl": "https://thumbnail.com/a.png",
            "name" : "Timmy",
            "defaultElements":[]
        },{
            headers:{
                "Authorization": `Bearer ${userToken}`
                }
        })

        expect(elementResponse.statusCode).toBe(403)
        expect(mapResponse.statusCode).toBe(403)
        expect(avatarResponse.statusCode).toBe(403)
        expect(updatElementResponse.statusCode).toBe(403)
    })

    test("Admin is able to hit endpoints ", async () => {
        

        const elementResponse = axios.post(`${BACKEND_URL}/api/v1/admin/element`, {

            "imageUrl":"",
            "width" : 1,
            "height" : 1,
            "static" : true
        }, {
            headers:{
                "Authorization": `Bearer ${adminToken}`
            }
        })

        

        const mapResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/map`,{
            "thumbnail": "https://thumbnail.com/a.png",
            "dimensions": "100x200",
            "defaultElements":[]
        },{
            headers:{
                "Authorization": `Bearer ${adminToken}`
                }
        })

        const avatarResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/avatar`,{
            "imageurl": "https://thumbnail.com/a.png",
            "name" : "Timmy",
            "defaultElements":[]
        },{
            headers:{
                "Authorization": `Bearer ${adminToken}`
                }
        })



        expect(elementResponse.statusCode).toBe(200)
        expect(mapResponse.statusCode).toBe(200)
        expect(avatarResponse.statusCode).toBe(200)

    })

    test("Admin is able to update the endpoint", async () => {

        const elementResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/element`, {
            "imageUrl": "",
            "width": 1,
            "height": 1,
            "static": true
        },{
            headers:{
                "Authorization": `Bearer ${adminToken}`
                }
        })
        const updatElementResponse = await axios.put(`${BACKEND_URL}/api/v1/admin/element/${elementResponse.data.id}`,{
            "imageurl": "https://thumbnail.com/a.png",
            "name" : "Timmy",
            "defaultElements":[]
        },{
            headers:{
                "Authorization": `Bearer ${adminToken}`
                }
        })

        expect(updatElementResponse.statusCode).toBe(200)
    })
})



describe("WebSocket Tests", () => {

    let adminToken
    let userToken
    let adminUserId
    let userId
    let mapId
    let element1Id
    let element2Id
    let spaceId
    let ws1
    let ws2
    let ws1Messages = []
    let ws2Messages = []
    let userX
    let userY
    let adminX
    let adminY

    async function awaitForAndPopLatestMessage(messageArray) {
        return new Promise(r => {
            if (messageArray.length > 0) {
                resolve( messageArray.shift())
            } else  {
                let interval = setTimeout(() => {
                    if (messageArray.length > 0) {
                       resolve  ( messageArray.shift())
                       clearInterval(interval)
                    }
                }, 100)
            }
        }) 
    }

    async function setupHTTP() {
        const username = `Yash-${Math.random()}`
        const password = "123455"
        const adminSignupResponse = await axios.post(`${BACKEND_URL}/aapi/v1/signup`,{
            username,
            password,
            role: "admin"
        })

        const adminSigninResponse = await axios.post(`${WS_URL}/aapi/v1/signup`,{
            username,
            password
        })

        adminUserId = adminSignupResponse.data.userId

        adminToken = adminSigninResponse.data.token

        const userSignupResponse = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
            username: username + `-user`,
            password
        })

        const userSigninResponse = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
            username: username + `-user`,
            password
        })

        userId = userSignupResponse.data.userId
        userToken = userSigninResponse.data.token

        const element1Response = axios.post(`${BACKEND_URL}/api/v1/admin/element`, {

            "imageUrl":"",
            "width" : 1,
            "height" : 1,
            "static" : true
        }, {
            headers:{
                "Authorization": `Bearer ${adminToken}`
            }
        })


        const element2Response = axios.post(`${BACKEND_URL}/api/v1/admin/element`, {

            "imageUrl":"",
            "width" : 1,
            "height" : 1,
            "static" : true
        }, {
            headers:{
                "Authorization": `Bearer ${adminToken}`
            }
        })
        element1Id = element1Response.data.id
        element2Id = element2Response.data.id

        const mapResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/map`,{
            "thumbnail": "https://thumbnail.com/a.png",
            "dimensions": "100x200",
            "defaultElements":[
            {
                elementId: element1Id,
                x: 20,
                y: 20,
            },
            {
                elementId: element1Id,
                x: 18,
                y: 20,
            },
            {
                elementId: element2Id,
                x: 19,
                y: 20,
            },
        ]
        },{
            headers:{
                "Authorization": `Bearer ${adminToken}`
                }
        })

        mapId = mapResponse.id

        const spaceResponse = await axios.post(`${BACKEND_URL}/api/v1/`, {
            "name": "test",
            "dimension" : "100x200",
            "mapId": mapId
        },{
            headers: {
                "Authorization": `Bearer ${userToken}`
            }
        })

        spaceId = spaceResponse.data.spaceId
    }
    async function  setupWs() {
        ws1 = new WebSocket(WS_URL)
        
        await new Promise (r => {
            ws1.onopen = r
        })
        ws1.onmessage = () => {
            ws1Messages.push(JSON.parse(event.data))
        }

        ws2 =  new WebSocket(WS_URL)

        await new Promise (r => {
            ws2.onopen = r
        })
        
        ws2.onmessage = () => {
            ws2Messages.push(JSON.parse(event.data))
        }

        
    }


    beforeAll( async () => {
        setupHTTP()
        setupWs()
})

test("Get back ack for joining the space ", async () => {
    ws1.send(JSON.stringify({
        "type": "join",
        "payload": {
            "spaceId": spaceId,
            "token" : adminToken
        }
    }))
    const message1 = await awaitForAndPopLatestMessage(ws1Messages)

    ws2.send(JSON.stringify({
        "type": "join",
        "payload": {
            "spaceId": spaceId,
            "token" : adminToken
        }
    }))

    const message2 =  await awaitForAndPopLatestMessage(ws2Messages)
    const message3 =  await awaitForAndPopLatestMessage(ws1Messages)

    expect(message1.type).toBe("space-joined")
    expect(message2.type).toBe("space-joined")

    expect(message1.payload.users.length).toBe(0)
    expect(message2.payload.users.length).toBe(1)
    expect(message3.type).toBe("user-join")
    expect(message3.payload.x).toBe(message2.payload.spawn.x)
    expect(message3.payload.y).toBe(message2.payload.spawn.y)
    expect(message3.payload.userId).toBe(userId)

    adminX = message1.payload.spawn.x
    adminY = message1.payload.spawn.y

    userX = message2.payload.spawn.x
    userY = message2.payload.spawn.y



})


test ("user should not able to move accross the boundaries", async () => {
    ws1.send(JSON.stringify({
        type: "movement",
        payload:{
            x:100000,
            y:100000
        }
    }))

    const message = await awaitForAndPopLatestMessage(ws1Messages)
    expect(message.type).toBe("movement-rejected")
    expect(message.payload.x).toBe(adminX)
    expect(message.payload.y).toBe(adminY)
})

test ("user should not able to move accross the boundaries", async () => {
    ws1.send(JSON.stringify({
        type: "movement",
        payload:{
            x:100000,
            y:100000
        }
    }))

    const message = await awaitForAndPopLatestMessage(ws1Messages)
    expect(message.type).toBe("movement-rejected")
    expect(message.payload.x).toBe(adminX)
    expect(message.payload.y).toBe(adminY)
})

test ("Correct movement should be broadcasted to the other socket in the room ", async () => {
    ws1.send(JSON.stringify({
        type: "movement",
        payload:{
            x: adminX + 1,
            y:adminY,
            userId: adminId
        }
    }))

    const message = await awaitForAndPopLatestMessage(ws2Messages)
    expect(message.type).toBe("movement")
    expect(message.payload.x).toBe(adminX + 1)
    expect(message.payload.y).toBe(adminY)
})

test ("if a user leave , the other user recieve a leave event ", async () => {
    ws1.close()

    const message = await awaitForAndPopLatestMessage(ws2Messages)
    expect(message.type).toBe("user-left")
    expect(message.payload.userId).toBe(adminUserId)

})

} )