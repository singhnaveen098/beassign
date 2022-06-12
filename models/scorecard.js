const mongoose = require('mongoose');
const { Schema } = mongoose;

const ScoreSchema = new Schema({
    sid: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
    subname: { type: String, required: true },
    score: { type: Number, required: true },
    comment: { type: String, required: true },
    examdate: { type: Date, required: true },
    carddate: { type: Date, default: Date.now }
});

const scorec = mongoose.model('scorec', ScoreSchema)
module.exports = scorec