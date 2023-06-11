const express = require('express');
const passport = require('passport');
const cookieParser = require('cookie-parser');
const expressSession = require('express-session');
const flash = require('connect-flash');
const bodyParser = require('body-parser');
const MemoryStore = require('memorystore')(expressSession)
const mongoose = require('mongoose');
const multer = require('multer');
const app = express();
const MongoDBSession = require('connect-mongodb-session')(expressSession)
const dotenv = require('dotenv');
dotenv.config({ path: ".env" });


mongoose.connect(
    process.env.MONGO_URL,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    },
    (err) => {
        console.log(err);
        console.log('connected to database');
    }
);

app.use(express.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true, parameterLimit: 50000 }));

app.use(cookieParser('random'));

const store = new MongoDBSession({
    uri: process.env.MONGO_URL,
    collection: "mySessions",
    expires: 1000 * 60 * 60 * 24
})


app.use(expressSession({
    secret: 'random',
    resave: true,
    saveUninitialized: true,
    maxAge: 24 * 60 * 60 * 1000,
    store
}));

app.use(express.static(__dirname + '/static'));

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');



app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.use(function (req, res, next) {
    res.locals.success_messages = req.flash('success_messages');
    res.locals.error_messages = req.flash('error_messages');
    res.locals.error = req.flash('error');
    next();
});

app.use(require('./controller/routes'));

app.listen(80, () => {
    console.log('listening on port 80');
});
