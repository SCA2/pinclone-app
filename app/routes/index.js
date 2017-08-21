'use strict';

var path = process.cwd();
var FavoriteHandler = require(path + '/app/controllers/favoriteHandler.server.js');

module.exports = function (app, passport) {

	function isLoggedIn (req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    } else {
      res.redirect('/login');
    }
  }

  var favoriteHandler = new FavoriteHandler();

  app.route('/')
    .get(function (req, res) {
      res.redirect('/favorites');
    });

  app.route('/login')
    .get(function (req, res) {
      res.redirect('/auth/twitter');
    });

  app.route('/logout')
    .get(function (req, res) {
      req.logout();
      res.redirect('/favorites');
    });

  app.route('/auth/twitter/callback')
    .get(passport.authenticate('twitter', {
      successRedirect: '/',
      failureRedirect: '/login'
    }));

  app.route('/auth/twitter')
    .get(passport.authenticate('twitter'));

  app.route('/favorites')
    .get(favoriteHandler.getFavorites)
    .post(isLoggedIn, favoriteHandler.createFavorite);

  app.route('/favorites/new')
    .get(favoriteHandler.newFavorite)

  app.route('/favorites/:favorite_id')
    .get(isLoggedIn, favoriteHandler.showFavorite)
    .post(isLoggedIn, favoriteHandler.updateFavorite)
    .delete(isLoggedIn, favoriteHandler.deleteFavorite);

  app.route('/favorites/:favorite_id/edit')
    .get(isLoggedIn, favoriteHandler.editFavorite)

  app.route('/favorites/:favorite_id/likes')
    .get(isLoggedIn, favoriteHandler.getFavoriteLikesCount)
    .post(isLoggedIn, favoriteHandler.toggleFavoriteLike);

  app.route('/users/:user_id')
    .get(isLoggedIn, favoriteHandler.getUser)

  app.route('/users/:user_id/favorites')
    .get(favoriteHandler.getUserFavorites);

};
