'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Favorite = new Schema({
  title : String,
  link  : String,
  likes : [{type: Schema.Types.ObjectId, ref: 'User'}]
});

Favorite.methods.getLikesCount = function(user, cb) {
  this.model('Favorite').findOne(
    { _id: this._id },
    function(error, favorite) {
      if(error) { console.log('Mongo error: ' + error.message) }
      cb(favorite.likes.length);
    }
  );
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
  console.log(req);
  this
    .findOneAndUpdate(
      { 'id': req.body.id },
      { $set: req.body },
      { new: true, upsert: true }
    ).exec((err, doc) => {
      req.user.favorites.addToSet(doc._id);
      req.user.save().then(cb(doc));
    });
}

module.exports = mongoose.model('Favorite', Favorite);


