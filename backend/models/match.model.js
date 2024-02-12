const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
    user1 : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User'
    },
    user2 : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User'
    },
});

const Match = mongoose.model('Match', matchSchema);
module.exports = Match;