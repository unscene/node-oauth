var vows = require('vows'),
    assert = require('assert'),
    oauth = require('../lib/oauth');

vows.describe('utilities').addBatch({
  'when merging an object': {
    topic: function() { return function(a,b) { return oauth.merge(a,b) } },
    'it should merge everything from the right hand into the left hand': function(topic) {
      assert.deepEqual(topic({a:1}, {b:2}),{a:1,b:2});
    },
    'it should ignore undefined': function(topic){
      assert.deepEqual(topic({a:1}, undefined),{a:1});
    },
    'it should ignore null': function(topic){
      assert.deepEqual(topic({a:1}, null),{a:1});
    },
    'it should ignore non objects': function(topic){
      assert.deepEqual(topic({a:1}, 1),{a:1});
    },
  },
})
.addBatch({
  'Parameter pruning RegEx': {
    topic: function () { return function(a) { return /^oauth_\w+$/.test(a) } },
    'should not match': function(topic) {
      assert.isFalse(topic('prop'));
    },
    'should match': function(topic) {
      assert.isTrue(topic('oauth_prop'))
    }
  }
}).export(module);
