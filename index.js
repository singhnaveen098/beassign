const express = require('express')
const cors = require('cors')
const app = express()
const connectmongo = require('./db')
const port = 3001

connectmongo()

app.use(cors())

app.use(express.json())

app.use('/auth', require('./routes/auth'))
app.use('/admin', require('./routes/admin'))
app.use('/teacher', require('./routes/teacher'))
app.use('/student', require('./routes/student'))
//response for wrong endpoints
app.use((req, res, next)=>{
    res.status(404).send({message:"Not Found"});
});

app.listen(port, () => {
    console.log('Backend connection successful')
})