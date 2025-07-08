const express = require('express')
const router = express.Router();

const {LoginRequest,createAccount,setCodeAsNewPassword} = require('../../controllers/user.controller')
const {authenticateToken} = require('../../utils/auth')


router.post('/auth/register', createAccount);
router.post('/auth/login',LoginRequest)


router.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({ message: 'Logout failed' });
    }
    res.clearCookie('connect.sid'); // Default cookie name for express-session
    res.json({ message: 'Logged out successfully' });
  });
});

router.put('/auth/reset',setCodeAsNewPassword)
module.exports = router