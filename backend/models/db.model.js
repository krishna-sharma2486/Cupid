const mongoose = require('mongoose');

const dbSchema = new mongoose.Schema({
    rollNo : {
        type: Number,
        required: true,
        unique: true
    },
    name : {
        type: String,
        required: true
    },
    branch : {
        type: String,
        required: true,
    },
});

const DB = mongoose.model('DB', dbSchema)
module.exports = DB;