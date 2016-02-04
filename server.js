// external modules
var bodyParser = require('body-parser');
var express = require('express');
var morgan = require('morgan');
var methodOveride = require('method-override');
var faker = require('faker');

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

app.get('/gallery/new', function (req, res) {
  res.render('index', {pageTitle: 'Express Gallery'});
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

app.get('/gallery/:id/edit', function (req, res) {
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

