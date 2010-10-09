var vows = require('vows'),
    assert = require('assert'),
    oauth = require('../lib/oauth');

vows.describe('Token').addBatch({
  'Creating a token': {
    topic: oauth.createToken(),
    'should return a token': function(topic) {
      assert.instanceOf(topic,oauth.Token);
    }
  },
  'Encoding a token': {
    topic: function () {     
      return oauth.createToken('key','secret').encode();
        
    },
    'should return only oauth properties': function(topic) {
      for (var prop in topic)        
          assert.match(prop,/^oauth_\w+$/);
    },
    'should not return empty properties': function(topic) {
      for (var prop in topic) {
        var val = topic[prop];
        assert.isTrue(val != '' && val != undefined && val != null);
      }
    }
  },
  'Decoding a token': {
    topic: function () {
      var consumer = oauth.createToken('key','secret');
      consumer.decode('oauth_token=test&oauth_token_secret=');
      return consumer;
    },
    'should parse the values into the token as properties': function(topic) {
      assert.equal(topic['oauth_token'],'test');
      assert.equal(topic['oauth_token_secret'],'');
    }
  }
}).export(module);
