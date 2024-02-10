const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    photo : {
        type: String
    },
    rollNo : {
        type: Number,
        required: true,
        unique: true
    },
    email : {
        type: String,
        required: true,
        unique: true
    },
    name : {
        type: String,
        required: true
    },
    gender : {
        type: String,
        required: true,
        enum : ["M", "F", "O"]
    },
    password : {
        type: String,
        required: true
    },
    branch : {
        type: String,
        required: true
    },
    crush : {
        type: String,
    },
    socials : {
        type: {
            instagram : String,
            facebook : String,
            linkedin : String,
            twitter : String
        },
        default: {
            instagram : "",
            facebook : "",
            linkedin : "",
            twitter : ""
        }
    },
}, {timestamps: true})

const User = mongoose.model('User', userSchema) //singular name of the collection

module.exports = User