'use strict';

(function () {

  var favorites = document.querySelectorAll('.favorite');

  function cacheBuster(url) {
    return url.replace(/\?cache=\d*/, "") + "?cache=" + new Date().getTime().toString();
  }

  function favoriteUrl(favorite) {
    return window.location.href + '/' + favorite.id + '/likes';
  }

  ajaxFunctions.ready(() => {
    favorites.forEach(favorite => {

      let image = favorite.querySelector('img.card-img-top');

      image.addEventListener('error', function(e) {
        image.src = 'https://lorempixel.com/295/325/abstract/'
      }, true);

      favorite.updateLikesCount = function(likes) {
        likes = JSON.parse(likes);
        favorite.querySelector('p.likes-total').innerHTML = "Likes " + likes;
      };
      ajaxFunctions.ajaxRequest('GET', favoriteUrl(favorite), favorite.updateLikesCount);
    })

    let images = document.querySelectorAll('img.card-img-top');

    for(let i = 0; i < images.length; i++) {
      images[i].src = cacheBuster(images[i].src);
    };
  });

  favorites.forEach((favorite) => {
    favorite.querySelector('p.likes-total').addEventListener('click', function() {
      ajaxFunctions.ajaxRequest('POST', favoriteUrl(favorite), function() {
        ajaxFunctions.ajaxRequest('GET', favoriteUrl(favorite), favorite.updateLikesCount);
      });
    }, false);
  });

})();
