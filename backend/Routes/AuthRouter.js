const { signup, login, getUserDetails } = require('../Controllers/AuthController');
const { signupValidation, loginValidation } = require('../Middlewares/authValidation');
const ensureAuthenticated = require('../Middlewares/Auth');

const router = require('express').Router();


router.post('/login',loginValidation, login);
router.post('/signup',signupValidation, signup);
router.get('/user-details',ensureAuthenticated, getUserDetails);

module.exports = router;