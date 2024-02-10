const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
    user : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User'
    },
    match : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User'
    },
});

const Match = mongoose.model('Match', matchSchema);
module.exports = Match;