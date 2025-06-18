const mongoose = require('mongoose')

const user = mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    createtime: { type: Date, default: Date.now },
    interest: { type: Array },
    Faculty: { type: String , required: true},
    Major:{ type: String , required: true},
    Year: { type: Number , required: true},
    
})


const UserSchema = mongoose.model('User', user)
module.exports = UserSchema