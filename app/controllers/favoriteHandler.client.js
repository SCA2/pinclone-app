'use strict';

(function () {

  var favorites = document.querySelectorAll('.favorite');

  
  function favoriteUrl(favorite) {
    return window.location.href + '/' + favorite.id + '/likes';
  }

  ajaxFunctions.ready(() => {
    favorites.forEach(favorite => {
      favorite.updateLikesCount = function(likes) {
        likes = JSON.parse(likes);
        favorite.querySelector('p.likes-total').innerHTML = "Likes " + likes;
      };
      ajaxFunctions.ajaxRequest('GET', favoriteUrl(favorite), favorite.updateLikesCount);
    })
  });

  favorites.forEach((favorite) => {
    favorite.querySelector('p.likes-total').addEventListener('click', function() {
      ajaxFunctions.ajaxRequest('POST', favoriteUrl(favorite), function() {
        ajaxFunctions.ajaxRequest('GET', favoriteUrl(favorite), favorite.updateLikesCount);
      });
    }, false);

    let image = favorite.querySelector('img.card-img-top');
    image.addEventListener('error', function() {
      image.src = 'http://lorempixel.com/295/325/abstract/'
    }, false);
  });

})();
