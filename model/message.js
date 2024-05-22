const mongoose = require('mongoose');

const messageSchema = mongoose.Schema({
    msg: String,
    sender: String,      /* username */
    receiver: String,
},
{
    timestamps: true
})
 
module.exports = mongoose.model('message', messageSchema)