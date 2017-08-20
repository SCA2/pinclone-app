'use strict';

var Favorite = require('./favorite');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var User = new Schema({
  twitter: {
    id: String,
    username: String,
    displayName: String,
    avatarURL: String
  },
});

User.methods.getFavorites = function(cb) {
  Favorite
    .find({ author: this._id })
    .exec((err, docs) => {
      cb(docs);
    })
}

module.exports = mongoose.model('User', User);
