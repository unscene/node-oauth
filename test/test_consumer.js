var vows = require('vows'),
    assert = require('assert'),
    oauth = require('../lib/oauth');

vows.describe('Consumer').addBatch({
  'Creating a consumer': {
    topic: oauth.createConsumer(),
    'should return a consumer': function(topic) {
      assert.instanceOf(topic,oauth.Consumer);
    }
  },
  'Encoding a consumer': {
    topic: oauth.createConsumer('key','secret'),
    'should return only oauth properties': function(topic) {
      for (var prop in topic.encode())
        if(typeof(topic[prop]) != 'function')
          assert.match(prop,/^oauth_\w+$/);
    },
    'should not return empty properties': function(topic) {
      for (var prop in topic.encode()) {
        var val = topic[prop];
        assert.isTrue(val != '' && val != undefined && val != null);
      }
    }
  },
  'Decoding a consumer': {
    topic: function () {
      var consumer = oauth.createConsumer('key','secret');
      consumer.decode('oauth_consumer_key=test&oauth_consumer_secret=');
      return consumer;
    },
    'should parse the values into the token as properties': function(topic) {
      assert.equal(topic['oauth_consumer_key'],'test');
      assert.equal(topic['oauth_consumer_secret'],'');
    }
  }
}).export(module);
