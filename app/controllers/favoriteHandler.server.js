'use strict';

var User = require('../models/user');
var Favorite = require('../models/favorite');

function FavoriteHandler () {

  this.getFavorites = function (req, res) {
    Favorite.getFavorites((err, favorites) => {
      if (err) { throw err; }
      res.render('../views/favorites/index.pug', { favorites: favorites });
    });
  };

  this.newFavorite = function (req, res) {
    let favorite = new Favorite();
    res.render('../views/favorites/new.pug', { favorite: favorite });
  };

  this.createFavorite = (req, res) => {
    Favorite.createFavorite(req, (err, favorite) => {
      res.render('../views/favorites/show.pug', { favorite: favorite });
    });
  };

  this.showFavorite = function (req, res) {
    Favorite.findById(req.params.favorite_id, (err, favorite) => {
      let isOwnedBy = req.isAuthenticated() && req.user && req.user._id.equals(favorite.author);
      res.render('../views/favorites/show.pug', { favorite: favorite, user: req.user, isOwnedBy: isOwnedBy });
    });
  };

  this.editFavorite = function (req, res) {
    Favorite.findById(req.params.favorite_id, (err, favorite) => {
      res.render('../views/favorites/edit.pug', { favorite: favorite });
    });
  };

  this.updateFavorite = (req, res) => {
    Favorite.updateFavorite(req, (err, favorite) => {
      res.render('../views/favorites/show.pug', { favorite: favorite });
    });
  };

  this.deleteFavorite = function (req, res) {
    Favorite
      .findById(req.params.favorite_id)  
      .exec((err, favorite) => {
        if (err) { throw err; }
        req.user.update({ $pull: { favorites: favorite._id }}, err => {
          favorite.remove();
          res.redirect('/favorites');
        });
      });
  };

  this.getFavoriteLikesCount = (req, res) => {
    Favorite
      .findOne({ '_id': req.params.favorite_id })
      .exec((err, favorite) => {
        favorite.getLikesCount(count => {
          res.json(count);
        });
      });
  };

  this.toggleFavoriteLike = (req, res) => {
    Favorite
      .findOne({ '_id': req.params.favorite_id })
      .exec((err, favorite) => {
        favorite.toggleLike(req.user, count => {
          res.send(count);
        });
      });
  };

  this.getUser = (req, res) => {
    res.render('../views/users/show.pug');
  };

  this.getUserFavorites = function (req, res) {
    Favorite
      .find({ 'author' : req.params.user_id })
      .exec(function (err, favorites) {
        if (err) { throw err; }
        res.render('../views/favorites/index.pug', { favorites: favorites });
      });
  };

}

module.exports = FavoriteHandler;
