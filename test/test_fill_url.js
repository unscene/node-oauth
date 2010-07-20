var vows = require('vows'),
    assert = require('assert'),
    oauth = require('../lib/oauth');

vows.describe('fill url').addBatch({
  'when hostname is missing': {
    topic: function(){return oauth.fillURL},
    'it should': function(topic){
      assert.equal(topic('/resource', 'example.com'), 'http://example.com/resource');
    },
    'it should 2': function(topic){
      assert.equal(topic('/resource?foo=bar', 'example.com'), 'http://example.com/resource?foo=bar');
    },
    'it should 3': function(topic){
      assert.equal(topic('http://www.example.com/resource', 'example.com'), 'http://www.example.com/resource');
    },
    'it should 4': function(topic){
      assert.equal(topic('/resource', 'example.com', 99), 'http://example.com:99/resource');
    },
    'it should 5': function(topic){
      assert.equal(topic('/resource', 'example.com', 99, true), 'https://example.com:99/resource');
    },
  },
}).export(module);
