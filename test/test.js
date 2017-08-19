'use strict';

process.env.NODE_ENV = 'test';

const mongoose = require("mongoose");
const User = require('../app/models/user');
const Favorite = require('../app/models/favorite');

const chai = require('chai');
const chaiHttp = require('chai-http');
const passportStub = require('passport-stub');

const server = require('../server');
const expect = chai.expect;

chai.use(chaiHttp);
passportStub.install(server);

describe('Favorite', () => {

  var user;

  beforeEach(done => {
    Favorite.count({}, (err, count) => {
      if(count > 0) {
        console.log('Deleting ' + count + ' favorites...');
        Favorite.remove({}, (err, raw) => {
          console.log('Mongo: ' + raw);
        });
      }

      Favorite.count({}, (err, count) => {
        console.log('Favorites at start: ' + count);

        user = new User({
          twitter: {
            id: '1234',
            displayName: 'Joe Tester',
            username: 'joe.tester'
          },
          favorites: []
        });

        done();         
      });
    });
  });

  describe('instance', () => {
    it('starts with no favorites in the database', done => {
      Favorite.count({}, (err, count) => {
        expect(count).to.eql(0);
        done();         
      })
    });

    it('creates a valid favorite', done => {
      let favorite = new Favorite({
        title : 'Cujo',
        link  : 'link_1@example.com',
        likes : []
      });

      favorite.save((err) => {
        expect(favorite.title).to.eql('Cujo');
        expect(favorite.link).to.eql('link_1@example.com');
        done();
      });
    });

    it('can create a like', done => {
      let favorite = new Favorite({
        title   : 'Cujo',
        link    : 'link_1@example.com',
        likes   : []
      });

      favorite.save(err => {
        favorite.createLike(user, doc => {
          expect(doc.likes[0]).to.eql(user._id)
          done();
        });
      });
    });

    it('can delete a like', done => {
      let favorite = new Favorite({
        title   : 'Cujo',
        link    : 'link_1@example.com',
        likes   : [user._id]
      });

      favorite.save(err => {
        favorite.deleteLike(user, doc => {
          expect(doc.likes).to.eql([])
          done();
        });
      });
    });

    it('can get likes count', done => {
      let favorite = new Favorite({
        title   : 'Cujo',
        link    : 'link_1@example.com',
        likes   : [user._id]
      });

      favorite.save(err => {
        favorite.getLikesCount(user, doc => {
          expect(doc).to.eql(1);
          done();
        });
      });
    });
  });

  describe('class', () => {
    it('starts with no favorites in the database', done => {
      Favorite.count({}, (err, count) => {
        expect(count).to.eql(0);
        done();
      })
    });

    it('can retrieve all favorites', done => {
      let f1 = new Favorite({
        title   : 'Cujo',
        link    : 'link_1@example.com',
        likes   : []
      });

      let f2 = new Favorite({
        title   : 'Firestarter',
        link    : 'link_2@example.com',
        likes   : []
      });

      f1.save(err => {
        f2.save(err => {
          Favorite.getFavorites((err, faves) => {
            expect(faves.length).to.eql(2);
            expect(faves[0].title).to.eql('Cujo');
            expect(faves[1].title).to.eql('Firestarter');
            done();
          });
        });
      });
    });

    it.only('can create a favorite', done => {
      user = new User({
        twitter: {
          id: '1234',
          displayName: 'Joe Tester',
          username: 'joe.tester'
        },
        favorites: []
      });

      let req = {
        body: {
          id    : null,
          title : 'Cujo',
          link  : 'link_1@example.com'
        },

        user: user
      };

      Favorite.createFavorite(req, favorite => {
        expect(favorite.title).to.eql('Cujo');
        expect(favorite.link).to.eql('link_1@example.com');
        expect(favorite.likes).to.eql([]);
        expect(user.favorites[0]).to.eql(user._id);
        done();
      });
    });

  });
});

describe('UI', () => {
  var user;

  beforeEach(done => {
    
    user = new User({
      twitter: {
        id: '1234',
        displayName: 'Joe Tester',
        username: 'joe.tester'
      },
      favorites: []
    });

    passportStub.logout();
    done();
  });

  describe('/users/:user_id', () => {
    it('redirects to /login if user not logged in', (done) => {
      chai.request(server)
      .get('/users/' + user._id)
      .redirects(0)
      .end((err, res) => {
        expect(res).to.redirect;
        expect(res.header.location).to.eql('/login');
        done();
      });
    });

    it('GETs a logged-in user profile', (done) => {
      passportStub.login( user );
      chai.request(server)
      .get('/users/' + user._id)
      .end((err, res) => {
        expect(res.status).to.eql(200);
        expect(res.type).to.eql('text/html');
        done();
      });
    });
  });
});

// describe('API', () => {


//   describe('/api/polls', () => {
//     it('GETs all of the polls', (done) => {
//       chai.request(server)
//       .get('/api/polls')
//       .end((err, res) => {
//         expect(res.text).to.include('President');
//         expect(res.text).to.include('Superheroes');
//         done();
//       });
//     });

//     it('redirects on POST if not logged in', (done) => {
//       chai.request(server)
//       .post('/api/polls')
//       .redirects(0)
//       .end((err, res) => {
//         expect(res).to.redirect;
//         expect(res.header.location).to.eql('/login');
//         done();
//       });
//     });

    // it('can create a favorite', done => {
    //   Favorite.createFavorite('FNSR', favorite => {
    //     expect(favorite.ticker).to.eql('FNSR');
    //     Favorite.count({}, (err, count) => {
    //       expect(count).to.eql(2)
    //       done();
    //     });
    //   });
    // });

    // it('can delete a favorite', done => {
    //   Favorite.deleteFavorite(favorite, favorite => {
    //     expect(favorite.ticker).to.eql('AAPL');
    //     Favorite.count({}, (err, count) => {
    //       expect(count).to.eql(0)
    //       done();
    //     });
    //   });
    // });

//     it('POSTs a new favorite', (done) => {
//       passportStub.login(user);
//       chai.request(server)
//       .post('/api/polls')
//       .send({poll_name: 'Ice Cream', option_1: 'Chocolate', option_2: 'Vanilla'})
//       .end((err, res) => {
//         expect(res).to.have.status(200);
//         expect(res.text).to.include('Ice Cream');
//         done();
//       });
//     });
//   });

//   describe('/api/polls/new', () => {
//     it('redirects to /login if user not logged in', (done) => {
//       chai.request(server)
//       .get('/api/polls/new')
//       .redirects(0)
//       .end((err, res) => {
//         expect(res).to.redirect;
//         expect(res.header.location).to.eql('/login');
//         done();
//       });
//     });

//     it('GETs new favorite form', (done) => {
//       passportStub.login(user);
//       chai.request(server)
//       .get('/api/polls/new')
//       .end((err, res) => {
//         expect(res.text).to.include('New Favorite');
//         done();
//       })
//     });
//   });

//   describe('/api/polls/:id', () => {
//     it('GETs :poll_id', (done) => {
//       passportStub.login(user);
//       chai.request(server)
//       .get('/api/polls/' + book_1._id)
//       .end((err, res) => {
//         expect(res.text).to.include('President');
//         expect(res.text).to.include('Clinton');
//         expect(res.text).to.include('Trump');
//         done();
//       });
//     });

//     it('redirects on PUT if user not logged in', (done) => {
//       chai.request(server)
//       .put('/api/polls/' + 'President')
//       .redirects(0)
//       .end((err, res) => {
//         expect(res).to.redirect;
//         expect(res.header.location).to.eql('/login');
//         done();
//       });
//     });

//     it('PUTs update to :poll_id', (done) => {
//       passportStub.login(user);
//       chai.request(server)
//       .put('/api/polls/' + book_1._id)
//       .send({favorite: {'President': {'Sanders':0, 'Trump':0}}})
//       .end((err, res) => {
//         expect(res.text).to.include('President');
//         expect(res.text).to.include('Sanders');
//         expect(res.text).to.include('Trump');
//         done();
//       });
//     });

//     it('redirects on DELETE if user not logged in', (done) => {
//       chai.request(server)
//       .delete('/api/polls/' + 'President')
//       .redirects(0)
//       .end((err, res) => {
//         expect(res).to.redirect;
//         expect(res.header.location).to.eql('/login');
//         done();
//       });
//     });

//     it('DELETEs :poll_id', (done) => {
//       passportStub.login(user);
//       chai.request(server)
//       .delete('/api/polls/' + book_1._id)
//       .end((err, res) => {
//         expect(res.text).not.to.include('President');
//         expect(res.text).to.include('Superheroes');
//         done();
//       });
//     });
//   });

//   describe('/api/polls/:poll_id/options', () => {
//     it('redirects on POST if user not logged in', (done) => {
//       chai.request(server)
//       .post('/api/polls/' + book_2.id + '/options')
//       .redirects(0)
//       .end((err, res) => {
//         expect(res).to.redirect;
//         expect(res.header.location).to.eql('/login');
//         done();
//       });
//     });

//     it('POSTs new option to :poll_id', (done) => {
//       var option = { new_option: 'Wonder Woman' };
//       passportStub.login(user);
//       chai.request(server)
//       .post('/api/polls/' + book_2._id + '/options')
//       .send(option)
//       .end((err, res) => {
//         // console.log(res.text)
//         expect(res.text).to.include('Wonder Woman');
//         // expect(res.text).to.include('Batman');
//         done();
//       });
//     });
//   });

//   describe('/api/:user_id/polls/:poll_id/options/:option_id', () => {
//     it('gets votes for :option_id in :poll_id', (done) => {
//       passportStub.login(user);
//       chai.request(server)
//       .get('/api/polls/' + book_2._id + '/options/' + 'Batman')
//       .end((err, res) => {
//         expect(res.body).to.equal(2);
//         done();
//       });
//     });

//     it('increments votes for :option_id in :poll_id', (done) => {
//       passportStub.login(user);
//       chai.request(server)
//       .put('/api/polls/' + book_2._id + '/options/' + 'Batman')
//       .end((err, res) => {
//         expect(res.body).to.equal(3);
//         done();
//       });
//     });

//     it('redirects on DELETE if user not logged in', (done) => {
//       chai.request(server)
//       .delete('/api/polls/' + book_2._id + '/options/' + 'Batman')
//       .redirects(0)
//       .end((err, res) => {
//         expect(res).to.redirect;
//         expect(res.header.location).to.eql('/login');
//         done();
//       });
//     });

//     it('DELETEs :option_id from :poll_id', (done) => {
//       passportStub.login(user);
//       chai.request(server)
//       .delete('/api/polls/' + book_2._id + '/options/' + 'Batman')
//       .end((err, res) => {
//         expect(res.text).to.include('Superheroes');
//         expect(res.text).to.not.include('Batman');
//         expect(res.text).to.include('Superman');
//         done();
//       });
//     });
//   });
// });