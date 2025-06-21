const mongoose = require('mongoose')
const { type } = require('os')


const groupSchema = mongoose.Schema({
    name: {type:String,require:true},
    creater: {type:String,require:true},
    icon: {type:String,require:true},
    desc: {type:String},
    members:{type:Array },
    posts:{type:Array},
    createAt: {type: Date ,require:true},
    tags:{type:Array },
})

const Group = mongoose.model('Group',groupSchema)

module.exports = Group;