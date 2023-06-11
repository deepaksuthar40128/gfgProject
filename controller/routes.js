const express = require('express');
const passport = require('passport');
const user = require('../model/user');
const bcryptjs = require('bcryptjs');
const app = express();
require('./passportLocal')(passport);
require('./googleAuth')(passport); 
const userRoutes = require('./accountRoutes');
const trainerRoutes = require('../functionRoutes/trainer');

function checkAuth(req, res, next) {
    if (req.isAuthenticated()) {
        res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, post-check=0, pre-check=0');
        next();
    } else {
        req.flash('error_messages', "Please Login to continue !");
        res.redirect('/login');
    }
}

app.get('/', (req, res) => {
    if (req.isAuthenticated()) {
        res.render('index', { username: req.user.username, userprofile: req.user.profile ? req.user.profile : " " });
    } else {
        res.render('auth', { logged: false });
    }
    // res.render('base', { logged: true })
})

app.get('/course',checkAuth,async (req, res) => {
    res.render('course', { username: req.user.username, userprofile: req.user.profile ? req.user.profile : "/images/noavtaruser.png"});
})

app.get('/details', checkAuth,async (req, res) => {
    res.render('details', { username: req.user.username, userprofile: req.user.profile ? req.user.profile : "/images/noavtaruser.png"});
})


app.get('/auth', async (req, res) => {
    res.render('auth');
})
app.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        // failureRedirect: '/user?mode=login',
        failureRedirect: '/auth',
        successRedirect: '/index',
        failureFlash: true,
    })(req, res, next);
})

app.post('/signup', async (req, res) => {

    let data = await user.findOne({ email: req.body.email });
    if (data) {
        req.flash('error_messages', "user already exist");
        // res.redirect('/user?mode=login');
        res.redirect('/auth');
    }
    else {
        let Maps =
            bcryptjs.genSalt(12, (err, salt) => {
                if (err) throw err;
                bcryptjs.hash(req.body.password, salt, async (err, hash) => {
                    if (err) throw err;
                    newData = new user({
                        username: req.body.username,
                        email: req.body.email,
                        profile: './images/noavtaruser.png',
                        password: hash,
                        googleId: null,
                        provider: 'email',
                        // Tags:
                    })
                    newData = await newData.save();
                    // res.redirect('/user?mode=login');
                    res.redirect('/auth');
                })
            });
    }
})
app.get('/profile', checkAuth, async(req, res) => {
    res.render('profile', { username: req.user.username, userprofile: req.user.profile ? req.user.profile : "/images/noavtaruser.png" });
})

app.get('/logout', (req, res) => {
    req.logout(function (err) {
        req.session.destroy(function (err) {
            res.redirect('/auth');
        });
    });
});

app.get('/index', (req, res) => {
    res.render('index', { username: req.user.username, userprofile: req.user.profile ? req.user.profile : "/images/noavtaruser.png" });

})

app.get('/user', async (req, res) => {
    let mode = req.query.mode;
    if (mode === 'login') {
        res.render("auth", { mode: 'login' });
    }
    else {
        res.render("auth", { mode: 'signup' });
    }
})

app.get('/login', (req, res) => {
    res.redirect('/user?mode=login');
})

app.get('/signup', (req, res) => {
    res.redirect('/user?mode=signup');
})

app.get('/google', passport.authenticate('google', { scope: ['profile', 'email',] }));

 
app.get('/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), (req, res) => {
    res.redirect('/index');
})
 
app.get('/help', (req, res) => {
    res.render('help');
})

app.use(userRoutes);
app.use(trainerRoutes);

module.exports = app;