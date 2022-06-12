const mongoose = require('mongoose');
const { Schema } = mongoose;

const ClassSchema = new Schema({
    name: { type: String, required: true },
    teacher: [{ type: mongoose.Schema.Types.ObjectId, ref: 'user', default: [] }],
    student: [{ type: mongoose.Schema.Types.ObjectId, ref: 'user', defaule: [] }],
    date: { type: Date, default: Date.now }
});

const classes = mongoose.model('classes', ClassSchema)
module.exports = classes