const mongoose = require('mongoose')
var plm = require('passport-local-mongoose');

const userSchema = mongoose.Schema({
    username: String,
    profilephoto:{
        type:String,
        default:"https://static.vecteezy.com/system/resources/thumbnails/005/545/335/small/user-sign-icon-person-symbol-human-avatar-isolated-on-white-backogrund-vector.jpg"
    },
    contact:Number,
    
    socketId :{
        type:String,
        default:""
    },
})
userSchema.plugin(plm)
module.exports = mongoose.model('user', userSchema)