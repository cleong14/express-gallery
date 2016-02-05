// adding authentication (1-3)
// 1. require in passport and passport-http
// 2. set up middleware
// 3. set up routes

// adding local authentication (4-9)
// 4. require in passport-local
// 5. set up middleware
// 6. set up LocalStrategy
// 7. serialize and deserialize user
// 8. set up login route 

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
// ==============4===============
var LocalStrategy = require('passport-local').Strategy;
// ==============4===============

var session = require('express-session');
var CONFIG = require('./config/config.json');

// my modules
var app = express();

// tells express which template engine we're using by npm module name
app.set('view engine', 'jade');

// tells express where our template files live
app.set('views', 'views');

// tells express where all the public files are located
// app.use(express.static('public'));

// starts using middleware
// ==============5===============
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session(CONFIG.SESSION));

app.use(passport.initialize());
app.use(passport.session());
// ==============5===============

app.use(morgan('dev'));
app.use(methodOveride('_method'));

// ==============2===============
// start using passport middleware
var user = { username: 'chaz', password: 'password', email: 'chaz@mail.com' };

// passport.use(new BasicStrategy(
//   function (username, password, done) {
//     if ( !(username === user.username && password === user.password) ) {
//       return done(null, false);
//     }
//     return done(null, user);
//   }));
// ==============2===============

// ==============6===============
passport.use(new LocalStrategy(
  function (username, password, done) {
    var isAuthenticated = authenticate(username, password);

    if(!isAuthenticated) { // not authenticated
      return done(null, false);
    }
    return done(null, user); // authenticated
  }));
// ==============6===============

// ==============7===============
passport.serializeUser(function (user, done) {
  // user passed in from local strategy
  // user attached to req.user
  return done(null, user);
});

passport.deserializeUser(function (user, done) {
  return done(null, user);
});
// ==============7===============

// ==============8===============
app.get('/login', function (req, res) {
  res.render('login');
});

app.post('/login',
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login'
  })
);

function authenticate (username, password) {
  var CREDENTIALS = CONFIG.CREDENTIALS;
  var USERNAME = CREDENTIALS.USERNAME;
  var PASSWORD = CREDENTIALS.PASSWORD;

  return (username === USERNAME &&
          password === PASSWORD);
}

function isAuthenticated (req, res, next) {
  // if not the return value of isAuthenticated();
  if (!req.isAuthenticated()) {
    return res.redirect('/login');
  }
  return next();
}
// ==============8===============

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
// app.get('/gallery/new',
//   passport.authenticate('basic', { session: false }),
//   function (req, res) {
//     res.render('index', {pageTitle: 'Express Gallery'});
//   });

// uses LOCAL STRATEGY to authenticate
app.get('/gallery/new',
  isAuthenticated,

  function (req, res) {
    res.render('index', {pageTitle: 'Express Gallery'});
  }
);

// ==============3===============
// app.get('/secret',
//   passport.authenticate('basic', { session: false }),
//   function (req, res) {
//     res.json(req.user);
//   });
// ==============3===============

// ==============9===============
  // app.get('/secret',
  //   isAuthenticated,

  //   function (req, res) {
  //     res.render('secret');
  //   }
  // );
// ==============9===============

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
// app.get('/gallery/:id/edit',
//   passport.authenticate('basic', { session: false }),
//   function (req, res) {
//     var id = req.params.id;

//     Gallery.find({
//       where: {
//         id: id
//       }
//     }).then(function (gallery) {
//       res.render('edit', {id: id});
//     });
//   }
// );

// used LOCAL STRATEGY to authenticate
app.get('/gallery/:id/edit',
  isAuthenticated,

  function (req, res) {
    var id = req.params.id;

    Gallery.find({
      where: {
        id: id
      }
    }).then(function (gallery) {
      res.render('edit', {id: id});
    });
  }
);

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

