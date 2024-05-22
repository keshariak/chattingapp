const user= require('./model/user')
const messageModel = require('./model/message')
const groupModel= require('./model/group')
const io = require( "socket.io" )();
const socketapi = {
    io: io
};



// Add your socket.io logic here!
io.on( "connection", function( socket ) {
    console.log( "A user connected");
    console.log(socket.id)

    socket.on('join-server', async userDetail=>{
        // console.log(userDetail.username)
        const currentUser= await user.findOne({
            username:userDetail.username
        })
        const allGroup= await groupModel.find({
            users:{
                $in:[
                    currentUser._id
                ]
            }
        })
        // console.log(allGroup)

        allGroup.forEach(group=>{
            socket.emit('group-joined', group)
        })
        
       await user.findOneAndUpdate({
            username:userDetail.username
        },{
            socketId : socket.id
        })

        const onlineUsers= await user.find({
            socketId:{
                $nin: [ '' ]
            }
        })

        onlineUsers.forEach(onlineUser => {
            if (onlineUser.socketId !== socket.id) {
                socket.emit('new-user-join', {
                    img: onlineUser.img,
                    username: onlineUser.username
                });
            }
        })
        // console.log(onlineUsers)
        
        socket.broadcast.emit('new-user-join', userDetail)
    })

    socket.on('disconnect', async () => {
        console.log("user Disconnected")
        await user.findOneAndUpdate({
            socketId: socket.id
        }, {
            socketId: ''
        })
    })

   
    socket.on('private-chat',async messageObject=>{
        await messageModel.create({
            msg: messageObject.message,
            sender: messageObject.sender,
            receiver: messageObject.receiver,

        })
        const receiver= await user.findOne({
            username:messageObject.receiver
        })

        if(!receiver){
            // jab receiver nahi milega
            const group= await groupModel.findOne({
                name: messageObject.receiver
            }).populate('users')

            if(!group){
                return
            }
            // console.log(group)
            group.users.forEach(user=>{
                // console.log(user.socketId)
                socket.to(user.socketId).emit("receive-private-chat", messageObject)
            })
            
        }

        if(receiver){
            socket.to(receiver.socketId).emit('receive-private-chat', messageObject);
        }
    
     

    })

    socket.on("fetch-conversation", async conversationDetails => {

        const isUser= await user.findOne({
            username:conversationDetails.receiver
        })

        if(isUser){
            const allMessages = await messageModel.find({
                $or: [
                    {
                        sender: conversationDetails.sender /* a */,
                        receiver: conversationDetails.receiver /* b */,
                    },
                    {
                        receiver: conversationDetails.sender /* a */,
                        sender: conversationDetails.receiver /* b */,
                    }
                ]
            })
    
            socket.emit('send-conversation', allMessages)

        }
        else{
            const allMessages = await messageModel.find({
                receiver: conversationDetails.receiver
            })
    
            // socket.emit('send-conversation', allMessages)   //allah
            socket.emit('send-conversation-group', allMessages)


        }
       

    })

    socket.on("createNewGroup", async groupDetails=>{
        // console.log(groupDetails)
        const newGroup= await groupModel.create({
            name:groupDetails.groupName
        })
        const currentUser= await user.findOne({
            username:groupDetails.sender
        })
        newGroup.users.push(currentUser._id)
        await newGroup.save();

        socket.emit('groupCreated', newGroup)
    })

    socket.on('join-group',async joiningdetails=>{
        const group= await groupModel.findOne({
            name:joiningdetails.groupName 
        })
        const currentUser= await user.findOne({
            username: joiningdetails.sender
        })
        group.users.push(currentUser._id)
        await group.save()

        socket.emit('group-joined',{
            profilephoto:group.profilephoto,
            name:group.name
        })
    })

    

});
// end of socket.io logic

module.exports = socketapi;