const router = require('express').Router();
const { login, register } = require('../controllers/authController');
const { authMiddleware, rbacMiddleware } = require('../middleware/authMiddleware');

router.post('/login', login);
router.post('/register', authMiddleware, rbacMiddleware('admin'), register);

module.exports = router;
