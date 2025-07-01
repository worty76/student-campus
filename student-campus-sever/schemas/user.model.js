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
    avatar_link: {type: String },
    profilePrivacy: { type: String, enum: ['everyone','friends', 'private'], default: 'everyone' },
    messagePrivacy: { type: String, enum: ['friends', 'noone'], default: 'friends' },
    notifcationSettings:{type: String, default: 'yes'}
})


const UserSchema = mongoose.model('User', user)
module.exports = UserSchema