'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Favorite = new Schema({
  title     : String,
  link      : String,
  avatarURL : String,
  author    : {type: Schema.Types.ObjectId, ref: 'User'},
  likes     : [{type: Schema.Types.ObjectId, ref: 'User'}]
});

Favorite.methods.getLikesCount = function(cb) {
  this.model('Favorite').findOne(
    { _id: this._id },
    function(error, favorite) {
      if(error) { console.log('Mongo error: ' + error.message) }
      cb(favorite.likes.length);
    }
  );
}

Favorite.methods.toggleLike = function(user, cb) {
  this.model('Favorite').findOne({ _id: this._id }, (error, favorite) => {
    if(error) { console.log('Mongo error: ' + error.message) }
    if(favorite.likes.indexOf(user._id) == -1) {
      this.createLike(user, cb)
    } else {
      this.deleteLike(user, cb)
    }
  });
}

Favorite.methods.createLike = function(user, cb) {
  this.model('Favorite').findOneAndUpdate(
    { _id: this._id },
    { $addToSet : { likes : user._id }},
    { new: true },
    function(error, favorite) {
      if(error) { console.log('Mongo error: ' + error.message) }
      cb(favorite);
    }
  );
}

Favorite.methods.deleteLike = function(user, cb) {
  this.model('Favorite').findOneAndUpdate(
    { _id: this._id },
    { $pull : { likes : user._id }},
    { new: true },
    function(error, favorite) {
      if(error) { console.log('Mongo error: ' + error.message) }
      cb(favorite);
    }
  );
}

Favorite.statics.getFavorites = function(cb) {
  this
    .find({}).sort({title: 'ascending'})
    .exec((err, favorites) => {
      cb(err, favorites);
    });
}

Favorite.statics.createFavorite = function(req, cb) {
  this
    .create(
      {
        title: req.body.title,
        link: req.body.link,
        author: req.body.author,
        avatarURL: req.body.avatarURL,
        likes: []
      },
      (err, favorite) => {
        cb(err, favorite);
      }
    );
}

Favorite.statics.updateFavorite = function(req, cb) {
  this
    .findOneAndUpdate(
      { '_id': req.params.favorite_id },
      { $set: req.body },
      { new: true, upsert: false }
    ).exec((err, favorite) => {
      cb(err, favorite);
    });

}

module.exports = mongoose.model('Favorite', Favorite);


