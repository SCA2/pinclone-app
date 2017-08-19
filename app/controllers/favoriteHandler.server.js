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

  this.showFavorite = function (req, res) {
    Favorite.findById(req.params.favorite_id, (err, favorite) => {
      let isOwnedBy = req.isAuthenticated() && req.user && (req.user.favorites.indexOf(favorite._id) != -1);
      res.render('../views/favorites/show.pug', { favorite: favorite, user: req.user, isOwnedBy: isOwnedBy });
    });
  };

  this.editFavorite = function (req, res) {
    Favorite.findById(req.params.favorite_id, (err, favorite) => {
      res.render('../views/favorites/new.pug', { favorite: favorite });
    });
  };

  this.createFavorite = (req, res) => {
    Favorite
      .findOneAndUpdate(
        { 'title': req.body.title },
        { $set: req.body },
        { new: true, upsert: true }
      ).exec((err, doc) => {
        req.user.favorites.addToSet(doc._id);
        req.user.save().then( res.redirect('/favorites') );
      });
  };

  this.updateFavorite = (req, res) => {
    Favorite
      .findOneAndUpdate(
        { '_id': req.body.favorite_id },
        { $set: req.body },
        { new: true, upsert: false }
      ).exec((err, doc) => {
        req.user.favorites.addToSet(doc._id);
        req.user.save().then( res.redirect('/favorites') );
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
          res.send(count);
        });
      });
  };

  this.createFavoriteLike = (req, res) => {
    Favorite
      .findOne({ '_id': req.params.favorite_id, request: req.user._id })
      .exec((err, favorite) => {
        favorite.createLike(req.user._id, count => {
          res.send(count);
        });
      });
  };

  this.deleteFavoriteLike = (req, res) => {
    Favorite
      .findOne({ '_id': req.params.favorite_id, request: req.user._id })
      .exec((err, favorite) => {
        favorite.deleteLike(req.user._id, count => {
          res.send(count);
        });
      });
  };

  this.getUser = (req, res) => {
    res.render('../views/users/show.pug');
  };

  this.getUserFavorites = function (req, res) {
    Favorite
      .find({ '_id' : { $in : req.user.favorites }})
      .exec(function (err, favorites) {
        if (err) { throw err; }
        res.render('../views/favorites/index.pug', { favorites: favorites });
      });
  };

}

module.exports = FavoriteHandler;
