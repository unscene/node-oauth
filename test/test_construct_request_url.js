var vows = require('vows'),
    assert = require('assert'),
    oauth = require('../lib/oauth');

function normalizeUrlTo(url) {
  var context = {
    topic: function() { return oauth.normalizeURL(this.context.name) }
  };
  context['should normalize to ' + url] = function(topic) { return assert.equal(topic,url) };
  return context;
}

vows.describe('construct request url').addBatch({
  'https://WWW.test.com:80/RESOURCE?key=value#fragment':    normalizeUrlTo('https://www.test.com:80/RESOURCE'),
  'https://www.test.com:80/resource?key=value#fragment':    normalizeUrlTo('https://www.test.com:80/resource'),
  'https://www.test.com:443/resource?key=value#fragment':   normalizeUrlTo('https://www.test.com/resource'),
  'http://www.test.com:80/resource?key=value#fragment':     normalizeUrlTo('http://www.test.com/resource'),
  'http://www.test.com:8080/resource?key=value#fragment':   normalizeUrlTo('http://www.test.com:8080/resource'),
  'HTTP://Example.com:80/resource?id=123':                  normalizeUrlTo('http://example.com/resource'),
  'HTTP://EXAMPLE.com:80/ReSOURCE':                         normalizeUrlTo('http://example.com/ReSOURCE'),
  'http://EXAMPLE.com:80/ReSOURCE':                         normalizeUrlTo('http://example.com/ReSOURCE'),
  'http://example.com/':                                    normalizeUrlTo('http://example.com/'),
  'http://example.com':                                     normalizeUrlTo('http://example.com/'),
  'http://example.com/resource':                            normalizeUrlTo('http://example.com/resource'),
  'HTTPS://Example.com:443/resource?id=123':                normalizeUrlTo('https://example.com/resource'),
  'https://example.com/resource':                           normalizeUrlTo('https://example.com/resource'),
  'http://example.com:8080/resource':                       normalizeUrlTo('http://example.com:8080/resource'),
  'https://example.com:8080/resource':                      normalizeUrlTo('https://example.com:8080/resource'),
}).export(module);

