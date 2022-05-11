const express = require('express')
const router =  express.Router()
const {signin,signup,me} = require('../controller/userController')

router.route('/signup').post(signup)
router.route('/signin').post(signin)
router.route('/me').get(me)

module.exports = router
