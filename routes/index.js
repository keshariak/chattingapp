var express = require('express');
var router = express.Router();
const db = require('../db')
const userModel = require('../model/user')


var users = require('../model/user')
var passport = require('passport')
var localStrategy = require('passport-local')
passport.use(new localStrategy(users.authenticate()))


/* GET home page. */
router.get('/', isloggedIn, async function(req, res, next) {
  // const loggedInUser = req.user
  const alluser = await userModel.find()
  userModel.findOne({username: req.session.passport.user}).then(function(founduser){
    res.render('index',{user: founduser, users: alluser})
  })
  // res.render('index', { title: 'Express' });
});

router.post('/register', (req, res, next) => {
var newUser = {
//user data here
 username: req.body.username,
 contact:req.body.contact,
 profilephoto:req.body.profilephoto
//user data here
};
users
.register(newUser, req.body.password)
.then((result) => {
passport.authenticate('local')(req, res, () => {
//destination after user register
res.redirect('/');
});
})
.catch((err) => {
res.send(err);
});
});


router.post('/login',passport.authenticate('local', {
successRedirect: '/',
failureRedirect: '/login',
}),
(req, res, next) => {}
);

router.get('/login', (req, res, next) => {
  res.render('login')
})
router.get('/register', (req, res, next) => {
  res.render('register')
})



function isloggedIn(req, res, next) {
if (req.isAuthenticated()) return next();
else res.redirect('/login');
}

module.exports = router;
