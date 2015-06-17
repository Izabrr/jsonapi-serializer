'use strict';
/* global describe, it */

var expect = require('chai').expect;

var JsonApiSerializer = require('../lib/serializer');

describe('Options', function () {
  describe('apiEndpointValue', function () {
    it('should override the apiEndpoint url', function (done) {
      new JsonApiSerializer('users', [], {
        apiEndpoint: 'http://localhost:3000/api',
        apiEndpointValue: 'http://localhost:3000/override'
      }).then(function (json) {
        expect(json).to.have.property('links');
        expect(json.links).to.have.property('self')
          .equal('http://localhost:3000/override');
        done(null, json);
      });
    });
  });

  describe('id', function () {
    it('should override the id field', function (done) {
      var dataSet = [{
        _id: '54735750e16638ba1eee59cb',
        firstName: 'Sandro',
        lastName: 'Munda',
      }, {
        _id: '5490143e69e49d0c8f9fc6bc',
        firstName: 'Lawrence',
        lastName: 'Bennett'
      }];

      new JsonApiSerializer('users', dataSet, {
        apiEndpoint: 'http://localhost:3000/api',
        id: '_id',
        attributes: ['firstName', 'lastName']
      }).then(function (json) {
        expect(json.data[0].id).equal('54735750e16638ba1eee59cb');
        done(null, json);
      });
    });
  });
});

describe('JSON API Serializer', function () {
  describe('Flat data collection', function () {
    it('should be set into the `data.attributes`', function (done) {
      var dataSet = [{
        id: '54735750e16638ba1eee59cb',
        firstName: 'Sandro',
        lastName: 'Munda',
      }, {
        id: '5490212e69e49d0c4f9fc6b4',
        firstName: 'Lawrence',
        lastName: 'Bennett'
      }];

      new JsonApiSerializer('users', dataSet, {
        apiEndpoint: 'http://localhost:3000/api',
        attributes: ['firstName', 'lastName'],
      }).then(function (json) {
        expect(json).to.have.property('data').with.length(2);

        expect(json.data[0]).to.have.property('id')
          .equal('54735750e16638ba1eee59cb');

        expect(json.data[0]).to.have.property('type').equal('users');

        expect(json.data[0]).to.have.property('attributes').that.is
          .an('object')
          .eql({
            'first-name': 'Sandro',
            'last-name': 'Munda',
          });

        done(null, json);
      });
    });
  });

  describe('Flat data resource', function () {
    it('should be set into the `data.attributes`', function (done) {
      var resource = {
        id: '54735750e16638ba1eee59cb',
        firstName: 'Sandro',
        lastName: 'Munda',
      };

      new JsonApiSerializer('users', resource, {
        apiEndpoint: 'http://localhost:3000/api',
        attributes: ['firstName', 'lastName'],
      }).then(function (json) {
        expect(json).to.have.property('data').and.to.be.instanceof(Object);

        expect(json.data).to.have.property('id')
          .equal('54735750e16638ba1eee59cb');

        expect(json.data).to.have.property('type').equal('users');

        expect(json.data).to.have.property('attributes').that.is
          .an('object')
          .eql({
            'first-name': 'Sandro',
            'last-name': 'Munda',
          });

        done(null, json);
      });
    });
  });

  describe('Nested document', function () {
    it('should be set into the `data.attributes`', function (done) {
      var dataSet = [{
        id: '54735750e16638ba1eee59cb',
        firstName: 'Sandro',
        lastName: 'Munda',
        address: {
          addressLine1: '406 Madison Court',
          zipCode: '49426',
          country: 'USA'
        },
      }, {
        id: '5490212e69e49d0c4f9fc6b4',
        firstName: 'Lawrence',
        lastName: 'Bennett',
        address: {
          addressLine1: '361 Shady Lane',
          zipCode: '23185',
          country: 'USA'
        }
      }];

      new JsonApiSerializer('users', dataSet, {
        apiEndpoint: 'http://localhost:3000/api',
        attributes: ['firstName', 'lastName', 'address'],
        address: {
          attributes: ['addressLine1', 'zipCode', 'country']
        }
      }).then(function (json) {
        expect(json.data[0].attributes).to.have.property('address')
          .that.is.an('object')
          .eql({
            addressLine1: '406 Madison Court',
            zipCode: '49426',
            country: 'USA'
          });

        done(null, json);
      });
    });
  });

  describe('Nested documents', function () {
    it('should be set into the `data.attributes`', function (done) {
      var dataSet = [{
        id: '54735750e16638ba1eee59cb',
        firstName: 'Sandro',
        lastName: 'Munda',
        books: [{
          title: 'Tesla, SpaceX, and the Quest for a Fantastic Future',
          isbn: '978-0062301239'
        }, {
          title: 'Steve Jobs',
          isbn: '978-1451648546'
        }]
      }, {
        id: '5490143e69e49d0c8f9fc6bc',
        firstName: 'Lawrence',
        lastName: 'Bennett',
        books: [{
          title: 'Zero to One: Notes on Startups, or How to Build the Future',
          isbn: '978-0804139298'
        }, {
          title: 'Einstein: His Life and Universe',
          isbn: '978-0743264747'
        }]
      }];

      new JsonApiSerializer('users', dataSet, {
        apiEndpoint: 'http://localhost:3000/api',
        attributes: ['firstName', 'lastName', 'books'],
        books: {
          attributes: ['title', 'isbn']
        }
      }).then(function (json) {
        expect(json.data[0].attributes).to.have.property('books')
          .that.is.an('array')
          .eql([{
            title: 'Tesla, SpaceX, and the Quest for a Fantastic Future',
            isbn: '978-0062301239'
          }, {
            title: 'Steve Jobs',
            isbn: '978-1451648546'
          }]);
        done(null, json);
      });
    });
  });

  describe('Compound document', function () {
    it('should be set into the `data.relationships` and `included`', function (done) {
      var dataSet = [{
        id: '54735750e16638ba1eee59cb',
        firstName: 'Sandro',
        lastName: 'Munda',
        address: {
          id: '54735722e16620ba1eee36af',
          addressLine1: '406 Madison Court',
          zipCode: '49426',
          country: 'USA'
        },
      }, {
        id: '5490143e69e49d0c8f9fc6bc',
        firstName: 'Lawrence',
        lastName: 'Bennett',
        address: {
          id: '54735697e16624ba1eee36bf',
          addressLine1: '361 Shady Lane',
          zipCode: '23185',
          country: 'USA'
        }
      }];

      new JsonApiSerializer('users', dataSet, {
        apiEndpoint: 'http://localhost:3000/api',
        attributes: ['firstName', 'lastName', 'address'],
        address: {
          ref: 'id',
          attributes: ['addressLine1', 'addressLine2', 'zipCode', 'country']
        }
      }).then(function (json) {
        expect(json.included).to.have.length(2);

        expect(json.included[0]).to.have.property('id')
          .equal('54735722e16620ba1eee36af');

        expect(json.included[0]).to.have.property('type').equal('addresses');

        expect(json.included[0]).to.have.property('attributes').to.be
          .an('object').eql({
            'address-line1': '406 Madison Court',
            'zip-code': '49426',
            'country': 'USA'
          });

        expect(json.data[0].relationships).to.have.property('address').that.is
          .an('object');

        expect(json.data[0].relationships.address.data).eql({
          id: '54735722e16620ba1eee36af',
          type: 'addresses'
        });

        done(null, json);
      });
    });
  });

  describe('Compound documents', function () {
    it('should be set into the `data.relationships` and `included`', function (done) {
      var dataSet = [{
        id: '54735750e16638ba1eee59cb',
        firstName: 'Sandro',
        lastName: 'Munda',
        books: [{
          id: '52735730e16632ba1eee62dd',
          title: 'Tesla, SpaceX, and the Quest for a Fantastic Future',
          isbn: '978-0062301239'
        }, {
          id: '52735780e16610ba1eee15cd',
          title: 'Steve Jobs',
          isbn: '978-1451648546'
        }]
      }, {
        id: '5490143e69e49d0c8f9fc6bc',
        firstName: 'Lawrence',
        lastName: 'Bennett',
        books: [{
          id: '52735718e16610ba1eee15cd',
          title: 'Zero to One: Notes on Startups, or How to Build the Future',
          isbn: '978-0804139298'
        }, {
          id: '52735671e16610ba1eee15ff',
          title: 'Einstein: His Life and Universe',
          isbn: '978-0743264747'
        }]
      }];

      new JsonApiSerializer('users', dataSet, {
        apiEndpoint: 'http://localhost:3000/api',
        attributes: ['firstName', 'lastName', 'books'],
        books: {
          ref: 'id',
          attributes: ['title', 'isbn']
        }
      }).then(function (json) {
        expect(json.included[0]).to.have.property('id')
          .equal('52735730e16632ba1eee62dd');

        expect(json.included[0]).to.have.property('type').equal('books');

        expect(json.included[0].attributes).to.be.eql({
          title: 'Tesla, SpaceX, and the Quest for a Fantastic Future',
          isbn: '978-0062301239'
        });

        expect(json.included[1]).to.have.property('id')
          .equal('52735780e16610ba1eee15cd');

        expect(json.included[1]).to.have.property('type').equal('books');

        expect(json.included[1].attributes).to.be.eql({
          title: 'Steve Jobs',
          isbn: '978-1451648546'
        });

        expect(json.data[0].relationships).to.have.property('books').that.is
          .an('object');

        expect(json.data[0].relationships.books.data).to.be.an('array')
          .eql([{
            type: 'books', 'id': '52735730e16632ba1eee62dd'
          }, {
            type: 'books', 'id': '52735780e16610ba1eee15cd'
          }]);

        done(null, json);
      });
    });
  });

  describe('Multiple compound documents (array -> object)', function () {
    it('should be set into the `data.relationships` and `included`', function (done) {
      var dataSet = [{
        id: '54735750e16638ba1eee59cb',
        firstName: 'Sandro',
        lastName: 'Munda',
        books: [{
          id: '52735730e16632ba1eee62dd',
          title: 'Tesla, SpaceX, and the Quest for a Fantastic Future',
          isbn: '978-0062301239',
          author: {
            id: '2934f384bb824a7cb7b238b8dc194a22',
            firstName: 'Ashlee',
            lastName: 'Vance'
          }
        }, {
          id: '52735780e16610ba1eee15cd',
          title: 'Steve Jobs',
          isbn: '978-1451648546',
          author: {
            id: '5ed95269a8334d8a970a2bd9fa599288',
            firstName: 'Walter',
            lastName: 'Isaacson'
          }
        }]
      }];

      new JsonApiSerializer('users', dataSet, {
        apiEndpoint: 'http://localhost:3000/api',
        attributes: ['firstName', 'lastName', 'books'],
        books: {
          ref: 'id',
          attributes: ['title', 'isbn', 'author'],
          author: {
            ref: 'id',
            attributes: ['firstName', 'lastName']
          }
        }
      }).then(function (json) {
        expect(json.included).to.include({
          type: 'books',
          id: '52735730e16632ba1eee62dd',
          attributes: {
            title: 'Tesla, SpaceX, and the Quest for a Fantastic Future',
            isbn: '978-0062301239'
          },
          relationships: {
            author: {
              data: { id: '2934f384bb824a7cb7b238b8dc194a22', type: 'authors' }
            }
          }
        });

        expect(json.included).to.include({
          type: 'books',
          id: '52735780e16610ba1eee15cd',
          attributes: {
            title: 'Steve Jobs',
            isbn: '978-1451648546'
          },
          relationships: {
            author: {
              data: {
                id: '5ed95269a8334d8a970a2bd9fa599288',
                type: 'authors'
              }
            }
          }
        });

        expect(json.included).to.include({
          id: '2934f384bb824a7cb7b238b8dc194a22',
          type: 'authors',
          attributes: {
            'first-name': 'Ashlee',
            'last-name': 'Vance'
          }
        });

        expect(json.included).to.include({
          id: '5ed95269a8334d8a970a2bd9fa599288',
          type: 'authors',
          attributes: {
            'first-name': 'Walter',
            'last-name': 'Isaacson'
          }
        });

        done(null, json);
      });
    });
  });

  describe('Multiple compound documents (array -> array)', function () {
    it('should be set into the `data.relationships` and `included`', function (done) {
      var dataSet = [{
        id: '54735750e16638ba1eee59cb',
        firstName: 'Sandro',
        lastName: 'Munda',
        books: [{
          id: '52735730e16632ba1eee62dd',
          title: 'Tesla, SpaceX, and the Quest for a Fantastic Future',
          isbn: '978-0062301239',
          authors: [{
            id: '2934f384bb824a7cb7b238b8dc194a22',
            firstName: 'Ashlee',
            lastName: 'Vance'
          }, {
            id: '5ed95269a8334d8a970a2bd9fa599288',
            firstName: 'Walter',
            lastName: 'Isaacson'
          }]
        }]
      }];

      new JsonApiSerializer('users', dataSet, {
        apiEndpoint: 'http://localhost:3000/api',
        attributes: ['firstName', 'lastName', 'books'],
        books: {
          ref: 'id',
          attributes: ['title', 'isbn', 'authors'],
          authors: {
            ref: 'id',
            attributes: ['firstName', 'lastName']
          }
        }
      }).then(function (json) {
        expect(json.included).to.include({
          type: 'books',
          id: '52735730e16632ba1eee62dd',
          attributes: {
            title: 'Tesla, SpaceX, and the Quest for a Fantastic Future',
            isbn: '978-0062301239'
          },
          relationships: {
            authors: {
              data: [
                { id: '2934f384bb824a7cb7b238b8dc194a22', type: 'authors' },
                { id: '5ed95269a8334d8a970a2bd9fa599288', type: 'authors' },
              ]
            }
          }
        });

        expect(json.included).to.include({
          id: '2934f384bb824a7cb7b238b8dc194a22',
          type: 'authors',
          attributes: {
            'first-name': 'Ashlee',
            'last-name': 'Vance'
          },
          relationships: {}
        });

        expect(json.included).to.include({
          id: '5ed95269a8334d8a970a2bd9fa599288',
          type: 'authors',
          attributes: {
            'first-name': 'Walter',
            'last-name': 'Isaacson'
          },
          relationships: {}
        });

        done(null, json);
      });
    });
  });
});