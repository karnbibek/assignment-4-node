const express = require('express');
const { check, body } = require('express-validator');

const authController = require('../controllers/auth');
const User = require('../models/user');

const router = express.Router();

router.get('/login', authController.getLogin);

router.get('/signup', authController.getSignup);

// post login
router.post('/login',
    [
        body('email')
            .isEmail()
            .withMessage("Please enter a valid email address!!"),
        body(
            'password', 'Please enter a valid password!!'
        )
            .isLength({ min: 1 })
            .trim()
    ],
    authController.postLogin
);

// post signup
router.post(
    '/signup',
    [
        body('firstName')
            .isString()
            .isLength({ min: 3 })
            .trim()
            .withMessage('Please enter a valid first name of at least 3 characters!'),
        body('lastName')
            .isString()
            .optional({ options: { nullable: true } })
            .isLength({ min: 3 })
            .trim()
            .withMessage('Please enter a valid last name of at least 3 characters!'),
        check('email')
            .isEmail()
            .withMessage('Please enter a valid email address')
            .custom((email, { req }) => {
                return User.findOne({ email })
                    .then(userDoc => {
                        if (userDoc) {
                            return Promise.reject('Email already exists!! Please login instead!');
                        }
                    });
            }),
        body('phone')
            .isMobilePhone()
            .isLength({ min: 10, max: 10 })
            .trim()
            .withMessage('Please enter a valid mobile number of 10 digits!'),
        body('password')
            .isString()
            .isLength({ min: 3 })
            .trim()
            .withMessage('Please enter a valid password of at least 3 characters!'),
        body('confirmPassword')
            .trim()
            .custom((value, { req }) => {
                if (value !== req.body.password) {
                    throw new Error('Password and confirm Password not matching!!')
                }
                return true;
            })
    ],
    authController.postSignup
);

router.post('/logout', authController.postLogout); 

module.exports = router;