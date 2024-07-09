const express = require('express');
const router = express.Router();
const {login,register,logout,getUser} = require('../controllers/authController');
const auth = require('../middleware/auth');


router.post('/register', register)
router.post('/login', login)
router.post('/logout',logout)
router.get('/user', auth, getUser)

module.exports = router;