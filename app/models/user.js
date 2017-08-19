'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var User = new Schema({
  twitter: {
    id: String,
    username: String,
    displayName: String
  },
  favorites: [{type: Schema.Types.ObjectId, ref: 'Favorite'}]
});

module.exports = mongoose.model('User', User);
