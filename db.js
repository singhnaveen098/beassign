const mongoose = require('mongoose')
const mongoURI = 'mongodb://localhost:27017/beassign?readPreference=primary&appname=MongoDB%20Compass&ssl=false'

const connectmongo = () => {
    mongoose.connect(mongoURI, () => {
        console.log('connected to mongo successfully')
    })
}

module.exports = connectmongo