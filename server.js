// adding authentication (1-3)
// 1. require in passport and passport-http
// 2. set up middleware
// 3. set up routes

// external modules
var bodyParser = require('body-parser');
var express = require('express');
var morgan = require('morgan');
var methodOveride = require('method-override');
var faker = require('faker');
var passport = require('passport');
// ==============1===============
var BasicStrategy = require('passport-http').BasicStrategy; // want to use basic Authentication Strategy
// ==============1===============

// my modules
var app = express();

// tells express which template engine we're using by npm module name
app.set('view engine', 'jade');

// tells express where our template files live
app.set('views', 'views');

// tells express where all the public files are located
// app.use(express.static('public'));

// starts using middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(morgan('dev'));
app.use(methodOveride('_method'));

// ==============2===============
// start using passport middleware
var user = { username: 'chaz', password: 'password', email: 'chaz@mail.com' };

passport.use(new BasicStrategy(
  function (username, password, done) {
    if ( !(username === user.username && password === user.password) ) {
      return done(null, false);
    }
    return done(null, user);
  }));
// ==============2===============

// require in database
var db = require('./models');

// var represents the filepath
var Gallery = db.Gallery;

// create gallery
app.post('/gallery', function (req, res) {
  Gallery.create({ author: req.body.author, link: req.body.link, description: req.body.description })
  .then(function (gallery) {
    res.json(gallery);
  });
});

// list of gallery photos
app.get('/', function (req, res) {
  Gallery.findAll()
  .then(function (gallery) {
    // res.json(gallery);
    // 'gallery' is the name of the file
    res.render('gallery', {galleries: gallery});
  });
});

// add authentication for /gallery/new
// ***authenticated***
app.get('/gallery/new',
  passport.authenticate('basic', { session: false }),
  function (req, res) {
    res.render('index', {pageTitle: 'Express Gallery'});
  });

// ==============3===============
app.get('/secret',
  passport.authenticate('basic', { session: false }),
  function (req, res) {
    res.json(req.user);
  });
// ==============3===============

// adding logout
app.get('/logout', function (req, res) {
  req.logout();
  res.removeHeader('Authorization');
  res.redirect('/');
});

app.post('/gallery', function (req, res) {
  res.send(res.locals.gallery);
});

// single gallery photo
app.get('/gallery/:id', function (req, res) {
  Gallery.find({
    where: {
      id: req.params.id
    }
  })
  .then(function (gallery) {
    res.json(gallery);
  });
});

// add authentication for /gallery/:id/edit
// ***authenticated***
app.get('/gallery/:id/edit',
  passport.authenticate('basic', { session: false }),
  function (req, res) {
    var id = req.params.id;

    Gallery.find({
      where: {
        id: id
      }
    }).then(function (gallery) {
      res.render('edit', {id: id});
    });
  });

app.put('/gallery/:id', function (req, res) {

  var newValues = {
    author: req.body.author,
    link: req.body.link,
    description: req.body.description
  };

  var query = {
    where: { id: req.params.id }, 
    returning:  true
  };
  // update is a sequelize method
  Gallery.update (newValues, query)
    .then(function (gallery) {
      res.send(gallery);
    });
});

// gets the delete form
app.get('/delete/:id', function (req, res) {
  var id = req.params.id;
  res.render('edit', {id: id});
});

// method to override delete
app.delete('/gallery/:id', function (req, res) {
  Gallery.destroy ({
    where: {
      id: req.params.id
    }
  });
});

// app.listen always at the bottom
app.listen(3000, function () {
  db.sequelize.sync();
});

