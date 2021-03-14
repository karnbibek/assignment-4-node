const crypto = require('crypto'); // builtin lib in nodejs to build secure random values.

const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');
const { validationResult } = require('express-validator');

const User = require('../models/user');

const transporter = nodemailer.createTransport(sendgridTransport({
    auth: {
        api_key: process.env.SENDGRID_API
    }
}));

exports.getLogin = (req, res, next) => {
    let message = req.flash('error');
    if (message.length > 0) {
        message = message[0];
    } else {
        message = null;
    }
    res.render('auth/login', {
        path: '/login',
        pageTitle: 'Login',
        errorMessage: message,
        oldInput: { email: '', password: '' },
        validationErrors: []
    });
}

exports.getSignup = (req, res, next) => {
    let message = req.flash('error');
    if (message.length > 0) {
        message = message[0];
    } else {
        message = null;
    }
    res.render('auth/signup', {
        path: '/signup',
        pageTitle: 'Signup',
        errorMessage: message,
        oldInput: { email: '', password: '', confirmPassword: '' },
        validationErrors: []
    });
};

exports.postLogin = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).render('auth/login', {
            path: '/login',
            pageTitle: 'Login',
            errorMessage: errors.array()[0].msg,
            oldInput: {
                email,
                password,
            },
            validationErrors: errors.array()
        });
    }

    User.findOne({ email })
        .then(user => {
            if (!user) {
                return res.status(422).render('auth/login', {
                    path: '/login',
                    pageTitle: 'Login',
                    errorMessage: 'Invalid email or password!!',
                    oldInput: { email, password },
                    validationErrors: []
                });
            }
            bcrypt.compare(password, user.password)
                .then(doMatch => {
                    if (doMatch) {
                        req.session.isLoggedIn = true;
                        req.session.user = user;
                        return req.session.save(err => {
                            // console.log(err);
                            res.redirect('/');
                        });
                    }
                    return res.status(422).render('/login', {
                        path: '/login',
                        pageTitle: 'Login',
                        errorMessage: 'Invalid email or password!!',
                        oldInput: { email, password },
                        validationErrors: []
                    });
                })
                .catch(err => {
                    // console.log(err);
                    res.redirect('/login');
                })
        })
        .catch(err => {
            // console.log(err);
            const error =  new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

exports.postSignup = (req, res, next) => {
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const email = req.body.email;
    const phone = req.body.phone;
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).render('auth/signup', {
            path: '/signup',
            pageTitle: 'Signup',
            errorMessage: errors.array()[0].msg,
            oldInput: { firstName, lastName, email, phone, password, confirmPassword },
            validationErrors: errors.array()
        });
    }

    bcrypt.hash(password, 12)
        .then(hashedPassword => {
            const user = new User({
                firstName, lastName, email, phone, password: hashedPassword
            });
            return user.save();
        })
        .then(result => {
            res.redirect('/login');
            return transporter.sendMail({
                to: email,
                from: 'karnabibek96@gmail.com',
                subject: 'Signup succeeded',
                html: '<h1>You have signed up successfully!!</h1>'
            })
        })
        .catch(err => {
            const error =  new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        })
}

exports.postLogout = (req, res, next) => {
    req.session.destroy(err => {
        console.log(err);
        res.redirect('/');
    });
};