var express = require('express');
var router = express.Router();
var isAuthenticated = require('../middleware/is-authenticated');

var db = require('../models');
var Gallery = db.Gallery;

router.route('/')
  .post(function (req, res) {
    Gallery.create({ author: req.body.author, link: req.body.link, description: req.body.description })
      .then(function (gallery) {
        // res.redirect('/gallery/' + result.id);
        res.json(gallery);
      }
    );
  })

  .post(function (req, res) {
    res.send(res.locals.gallery);
  });

router.route('/new')
.get(
  isAuthenticated,
  function (req, res) {
    res.render('index', {pageTitle: 'Express Gallery'});
  }
);

router.route('/:id')
  .get(function (req, res) {
    Gallery.find({
      where: {
        id: req.params.id
      }
    })
    .then(function (gallery) {
      res.json(gallery);
    });
  })

  .put(function (req, res) {
    var newValues = {
      author: req.body.author,
      link: req.body.link,
      description: req.body.description
    };

    var query = {
      where: { id: req.params.id },
      returning: true
    };

    // update is a sequelize method
    Gallery.update (newValues, query)
      .then(function (gallery) {
        res.send(gallery);
      }
    );
  })

  .delete(
    isAuthenticated,
    function (req, res) {
    Gallery.destroy ({
      where: {
        id: parseInt(req.params.id)
      }
    })
    .then(function (gallery) {
      res.redirect('/');
    });
  });

router.route('/:id/edit')
  .get(
    isAuthenticated,
    function (req, res) {
      var id = req.params.id;

      Gallery.find({
        where: {
          id: id
        }
      })
      .then(function (gallery) {
        res.render('edit', {id: id});
      });
    }
  );

router.route('/delete/:id')
  .get(function (req, res) {
    var id = req.params.id;
    res.render('edit', {id: id});
  });

module.exports = router;