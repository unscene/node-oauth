var vows = require('vows'),
    assert = require('assert'),
    oauth = require('../lib/oauth'),
	uuid = require('node-uuid');

vows.describe('RealmSignatures') .addBatch({
  'In a valid request token flow': {
    topic: function() {
      var hmac = oauth.createHmac(consumer,token);
      var consumer = oauth.createConsumer( 'sign_key', 'sign_secret' );
      var token = null;
      var signed = oauth.createHmac( consumer, token );
      var method = 'post',
          url = 'http://api.google.com/oauth',
          realm = 'testable_realm',
          params = {
            oauth_signature_method:'HMAC-SHA1',
            oauth_version:'1.0'
          };
      return oauth.signRequest(method, url, {}, {}, signed, realm);
    },
    'Auth header should be set to ': function(topic) {

    var oauth_pattern = /OAuth oauth_consumer_key\=\"sign_key\"\,oauth_nonce\=\"[A-F0-9]{8}-[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{12}\"\,oauth_signature_method\=\"HMAC-SHA1\"\,oauth_timestamp\=\"[0-9]{10}\"\,oauth_version\=\"1\.0\"\,realm\=\"testable_realm\"\,oauth_signature\=/g;

    var matched = oauth_pattern.exec(topic.authorization);
    if ( assert.isArray( matched ) ) {
        return assert.isNotEmpty( matched );
    }
    return false;
    }
  }
}).export(module);
