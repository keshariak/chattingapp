const  mongoose = require("mongoose");

const groupSchema = mongoose.Schema({
    name:{
        type: String,
        unique: true

    },
    profilephoto:{
        type:String,
        default:"https://cdn-icons-png.flaticon.com/512/10017/10017806.png"
    },
    users:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref: 'user'
        }
    ]
})
module.exports= mongoose.model('group', groupSchema)