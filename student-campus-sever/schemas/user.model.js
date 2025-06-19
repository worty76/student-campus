const mongoose = require('mongoose')

const user = mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    createtime: { type: Date, default: Date.now },
    friends: { type: Array },
    Faculty: { type: String , required: true},
    Major:{ type: String , required: true},
    Year: { type: String , required: true},
    avatar_link: {type: String }

    
})


const UserSchema = mongoose.model('User', user)
module.exports = UserSchema