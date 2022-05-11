const express = require('express')
const  userRouter = require('./router/userRouter')
require('dotenv').config()


const app = express()

app.get('/',(req,res)=>{
    res.status(200).json('all fine')
})

app.use(express.json())

app.use('/user',userRouter)

const port = process.env.PORT || 5000
app.listen(port,()=>{
    console.log('running on 5000');
})

