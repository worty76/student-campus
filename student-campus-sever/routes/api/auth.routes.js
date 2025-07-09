const express = require('express')
const router = express.Router();

const {LoginRequest,createAccount,setCodeAsNewPassword,sendVerification} = require('../../controllers/user.controller')
const {authenticateToken} = require('../../utils/auth')


router.post('/auth/register', createAccount);
router.post('/auth/login',LoginRequest)
router.post('/register/verification',sendVerification)
router.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({ message: 'Logout failed' });
    }
    res.clearCookie('connect.sid'); 
    res.json({ message: 'Logged out successfully' });
  });
});

router.put('/auth/reset',setCodeAsNewPassword)
module.exports = router