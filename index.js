const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const flash = require('connect-flash');

const errorController = require('./controllers/error');
const User = require('./models/user');

// databases
const MONGODB_URI = 'mongodb+srv://bibek28:mongoDBpassword789@cluster0.xakqz.mongodb.net/jobportal?retryWrites=true&w=majority';
const store = new MongoDBStore({
    uri: MONGODB_URI,
    collection: 'sessions'
});
const csrfProtection = csrf();

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

const userRoutes = require('./routes/userRoutes');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(
    session({
        secret: 'jobPortal secret key',
        resave: false,
        saveUninitialized: false,
        store: store
    })
);
app.use(csrfProtection);
app.use(flash());

app.use((req, res, next) => {
    res.locals.isAuthenticated = req.session.isLoggedIn;
    res.locals.csrfToken = req.csrfToken();
    next();
});

app.use((req, res, next) => {
    if (!req.session.user) {
        return next();
    }
    User.findById(req.session.user._id)
        .then(user => {
            if (!user) {
                return next();
            };
            req.user = user;
            next();
        })
        .catch(err => {
            next(new Error(err));
        });
});
app.get('/load-session', (req, res, next) => {
    if (!req.session.user) {
        return res.json({ fLoggedIn: false });
        // return next();
    }
    User.findById(req.session.user._id)
        .then(user => {
            if (!user) {
                return next();
            };
            return res.status(200).json({user});
            next();
        })
        .catch(err => {
            next(new Error(err));
        });
});

const companiesRoutes = require('./routes/companiesRoutes');
// app.use('/companies', companiesRoutes);
app.use(companiesRoutes);

app.use(userRoutes);

const authRoutes = require('./routes/auth');
app.use(authRoutes);

app.use('/500', errorController.get500);

app.use(errorController.get404);

app.use((error, req, res, next) => {
    res.status(500).render('500', {
        pageTitle: 'Error!',
        path: '/500',
        isAuthenticated: req.session.isLoggedIn
    });
})

mongoose
    .connect(
        MONGODB_URI, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useUnifiedTopology: true,
        retryWrites: true,
    }
    )
    .then(result => {
        app.listen(3000);
    })
    .catch(err => {
        console.log(err);
    });
