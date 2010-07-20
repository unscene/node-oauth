var vows = require('vows'),
    assert = require('assert'),
    oauth = require('../lib/oauth');

vows.describe('signature base string').addBatch({
  'base_string': {
    topic: function() {return oauth.Signature.prototype.baseString},
    'example A.5.1': function(topic) {
      var params = {
        'oauth_consumer_key':'dpf43f3p2l4k3l03',
        'oauth_token':'nnch734d00sl2jdk',
        'oauth_signature_method':'HMAC-SHA1',
        'oauth_timestamp':'1191242096',
        'oauth_nonce':'kllo9940pd9333jh',
        'oauth_version':'1.0',
        'file':'vacation.jpg',
        'size':'original'
      };

      assert.equal(topic('get', 'http://photos.example.net/photos', params), 'GET&http%3A%2F%2Fphotos.example.net%2Fphotos&file%3Dvacation.jpg%26oauth_consumer_key%3Ddpf43f3p2l4k3l03%26oauth_nonce%3Dkllo9940pd9333jh%26oauth_signature_method%3DHMAC-SHA1%26oauth_timestamp%3D1191242096%26oauth_token%3Dnnch734d00sl2jdk%26oauth_version%3D1.0%26size%3Doriginal');
    },
    'example 1': function(topic) {
      var params = {
        oauth_consumer_key:'GDdmIQH6jhtmLUypg82g',
        oauth_callback:'http://localhost:3005/the_dance/process_callback?service_provider_id=11',
        oauth_nonce:'QP70eNmVz8jvdPevU3oJD2AfF7R7odC2XJcn4XlZJqk',
        oauth_signature_method:'HMAC-SHA1',
        oauth_timestamp:'1272323042',
        oauth_version:'1.0'
      };
      assert.equal(topic('post', 'https://api.twitter.com/oauth/request_token', params), 'POST&https%3A%2F%2Fapi.twitter.com%2Foauth%2Frequest_token&oauth_callback%3Dhttp%253A%252F%252Flocalhost%253A3005%252Fthe_dance%252Fprocess_callback%253Fservice_provider_id%253D11%26oauth_consumer_key%3DGDdmIQH6jhtmLUypg82g%26oauth_nonce%3DQP70eNmVz8jvdPevU3oJD2AfF7R7odC2XJcn4XlZJqk%26oauth_signature_method%3DHMAC-SHA1%26oauth_timestamp%3D1272323042%26oauth_version%3D1.0');
    },
    'example 2': function(topic) {
      var params = {
        oauth_token:'819797-Jxq8aYUDRmykzVKrgoLhXSq67TEa5ruc4GJC2rWimw',
        oauth_consumer_key:'GDdmIQH6jhtmLUypg82g',
        oauth_nonce:'oElnnMTQIZvqvlfXM56aBLAf5noGD0AQR3Fmi7Q6Y',
        oauth_signature_method:'HMAC-SHA1',
        oauth_timestamp:'1272325550',
        oauth_version:'1.0',
        status:'setting up my twitter 私のさえずりを設定する'
      }
      assert.equal(topic('post', 'http://api.twitter.com/1/statuses/update.json', params), 'POST&http%3A%2F%2Fapi.twitter.com%2F1%2Fstatuses%2Fupdate.json&oauth_consumer_key%3DGDdmIQH6jhtmLUypg82g%26oauth_nonce%3DoElnnMTQIZvqvlfXM56aBLAf5noGD0AQR3Fmi7Q6Y%26oauth_signature_method%3DHMAC-SHA1%26oauth_timestamp%3D1272325550%26oauth_token%3D819797-Jxq8aYUDRmykzVKrgoLhXSq67TEa5ruc4GJC2rWimw%26oauth_version%3D1.0%26status%3Dsetting%2520up%2520my%2520twitter%2520%25E7%25A7%2581%25E3%2581%25AE%25E3%2581%2595%25E3%2581%2588%25E3%2581%259A%25E3%2582%258A%25E3%2582%2592%25E8%25A8%25AD%25E5%25AE%259A%25E3%2581%2599%25E3%2582%258B');
    },
    'wiki_1_simple_with_ending_slash': function(topic) {
      assert.equal(topic('get', 'http://example.com/', {n:'v'}),'GET&http%3A%2F%2Fexample.com%2F&n%3Dv');
    },
    'wiki_2_simple_without_ending_slash': function(topic) {
      assert.equal(topic('get', 'http://example.com', {n:'v'}),'GET&http%3A%2F%2Fexample.com%2F&n%3Dv');
    },
    'example 3': function(topic) {
      assert.equal(topic('get', 'http://example.com', {foo:'bar/baz'}),'GET&http%3A%2F%2Fexample.com%2F&foo%3Dbar%252Fbaz');
    },
    'example 4': function(topic) {
      var params = {
        oauth_consumer_key: 'dpf43f3p2l4k3l03',
        oauth_token: 'nnch734d00sl2jdk',
        oauth_nonce: 'CVUoMBFqZET4z34',
        oauth_timestamp: '1279644048',
        oauth_signature_method: 'HMAC-SHA1',
        oauth_version:  '1.0',
        status: "'Tue Jul 20 2010 18:40:48 GMT+0200 (CEST)'"
      }
      assert.equal(topic('post', 'http://api.twitter.com/1/statuses/update.json', params), 'POST&http%3A%2F%2Fapi.twitter.com%2F1%2Fstatuses%2Fupdate.json&oauth_consumer_key%3Ddpf43f3p2l4k3l03%26oauth_nonce%3DCVUoMBFqZET4z34%26oauth_signature_method%3DHMAC-SHA1%26oauth_timestamp%3D1279644048%26oauth_token%3Dnnch734d00sl2jdk%26oauth_version%3D1.0%26status%3D%2527Tue%2520Jul%252020%25202010%252018%253A40%253A48%2520GMT%252B0200%2520%2528CEST%2529%2527');
    },
    'example 5': function(topic) {
      assert.equal(topic('post', 'http://example.com', {status: "'Tue Jul 20 2010 18:40:48 GMT+0200 (CEST)'"}), 'POST&http%3A%2F%2Fexample.com%2F&status%3D%2527Tue%2520Jul%252020%25202010%252018%253A40%253A48%2520GMT%252B0200%2520%2528CEST%2529%2527');
    },
  },
}).export(module);
