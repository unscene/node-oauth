var vows = require('vows'),
    assert = require('assert'),
    oauth = require('../lib/oauth');

var params_for_signature = function(params) {
  return oauth.params_for_signature(params);
};

vows.describe('Normalize Request Parameters').addBatch({
  'when normalizing an object': {
    topic: function () {
      return oauth.normalize(
        {d: 1, b: 2, x: 3, a: 4, c: 5, func: function() { return } })
      },
    'it should be sorted lexiographically': function(topic) {
      assert.deepEqual(topic, {a: 4, b: 2, c: 5, d: 1, x: 3});
    },
    'it should exclude functions': function(topic) {
      assert.deepEqual(topic, {a: 4, b: 2, c: 5, d: 1, x: 3});
    }
  }
}).export(module);
