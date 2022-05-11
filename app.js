const express = require('express')
const  userRouter = require('./router/userRouter')
require('dotenv').config()


const app = express()


app.use(express.json())

app.use('/user',userRouter)

app.listen(5000,()=>{
    console.log('running on 5000');
})

