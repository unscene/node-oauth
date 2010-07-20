var vows = require('vows'),
    assert = require('assert'),
    oauth = require('../lib/oauth');

vows.describe('Signatures') .addBatch({
  'In a valid request token flow': {
    topic: function() {
      var consumer = oauth.createConsumer('GDdmIQH6jhtmLUypg82g','MCD8BKwGdgPHvAuvgvz4EQpqDAtx89grbuNMRd7Eh98');
          token = oauth.createToken();
          hmac = oauth.createHmac(consumer,token);

      var method = 'post',
          url = 'https://api.twitter.com/oauth/request_token',
          params = {
            oauth_consumer_key:'GDdmIQH6jhtmLUypg82g',
            oauth_callback:'http://localhost:3005/the_dance/process_callback?service_provider_id=11',
            oauth_nonce:'QP70eNmVz8jvdPevU3oJD2AfF7R7odC2XJcn4XlZJqk',
            oauth_signature_method:'HMAC-SHA1',
            oauth_timestamp:'1272323042',
            oauth_version:'1.0'
          };

      return function(action) { return hmac[action](method,url,params) };
    },
    'base string should resolve to ': function(fn) {
      return assert.equal(fn('base'),'POST&https%3A%2F%2Fapi.twitter.com%2Foauth%2Frequest_token&oauth_callback%3Dhttp%253A%252F%252Flocalhost%253A3005%252Fthe_dance%252Fprocess_callback%253Fservice_provider_id%253D11%26oauth_consumer_key%3DGDdmIQH6jhtmLUypg82g%26oauth_nonce%3DQP70eNmVz8jvdPevU3oJD2AfF7R7odC2XJcn4XlZJqk%26oauth_signature_method%3DHMAC-SHA1%26oauth_timestamp%3D1272323042%26oauth_version%3D1.0');
    },
    'signature should resolve to': function(fn) {
      return assert.equal(fn('sign'),'8wUi7m5HFQy76nowoCThusfgB+Q=');
    }
  }
})
.addBatch({
  'In a valid access token flow': {
    topic: function() {
      var consumer = oauth.createConsumer('GDdmIQH6jhtmLUypg82g','MCD8BKwGdgPHvAuvgvz4EQpqDAtx89grbuNMRd7Eh98');
          token = oauth.createToken('8ldIZyxQeVrFZXFOZH5tAwj6vzJYuLQpl0WUEYtWc','x6qpRnlEmW9JbQn4PQVVeVG8ZLPEx6A0TOebgwcuA');
          hmac = oauth.createHmac(consumer,token);

      var method = 'post',
          url = 'https://api.twitter.com/oauth/access_token',
          params = {
            oauth_token:'8ldIZyxQeVrFZXFOZH5tAwj6vzJYuLQpl0WUEYtWc',
            oauth_consumer_key:'GDdmIQH6jhtmLUypg82g',
            oauth_nonce:'9zWH6qe0qG7Lc1telCn7FhUbLyVdjEaL3MO5uHxn8',
            oauth_signature_method:'HMAC-SHA1',
            oauth_timestamp:'1272323047',
            oauth_version:'1.0',
            oauth_verifier:'pDNg57prOHapMbhv25RNf75lVRd6JDsni1AJJIDYoTY'
          };

      return function(action) { return hmac[action](method,url,params) };
    },
    'the base string should resolve to ': function(fn) {
      return assert.equal(fn('base'),'POST&https%3A%2F%2Fapi.twitter.com%2Foauth%2Faccess_token&oauth_consumer_key%3DGDdmIQH6jhtmLUypg82g%26oauth_nonce%3D9zWH6qe0qG7Lc1telCn7FhUbLyVdjEaL3MO5uHxn8%26oauth_signature_method%3DHMAC-SHA1%26oauth_timestamp%3D1272323047%26oauth_token%3D8ldIZyxQeVrFZXFOZH5tAwj6vzJYuLQpl0WUEYtWc%26oauth_verifier%3DpDNg57prOHapMbhv25RNf75lVRd6JDsni1AJJIDYoTY%26oauth_version%3D1.0');
    },
    'the signature should resolve to': function(fn) {
      return assert.equal(fn('sign'),'PUw/dHA4fnlJYM6RhXk5IU/0fCc=');
    }
  }
})
.addBatch({
  'When accessing a protected resource': {
    topic: function() {
      var consumer = oauth.createConsumer('GDdmIQH6jhtmLUypg82g','MCD8BKwGdgPHvAuvgvz4EQpqDAtx89grbuNMRd7Eh98');
          token = oauth.createToken('819797-Jxq8aYUDRmykzVKrgoLhXSq67TEa5ruc4GJC2rWimw','J6zix3FfA9LofH0awS24M3HcBYXO5nI1iYe8EfBA');
          hmac = oauth.createHmac(consumer,token);

      var method = 'post',
          url = 'http://api.twitter.com/1/statuses/update.json',
          params = {
            oauth_token:'819797-Jxq8aYUDRmykzVKrgoLhXSq67TEa5ruc4GJC2rWimw',
            oauth_consumer_key:'GDdmIQH6jhtmLUypg82g',
            oauth_nonce:'oElnnMTQIZvqvlfXM56aBLAf5noGD0AQR3Fmi7Q6Y',
            oauth_signature_method:'HMAC-SHA1',
            oauth_timestamp:'1272325550',
            oauth_version:'1.0',
            status:'setting up my twitter 私のさえずりを設定する'
          };

      return function(action) { return hmac[action](method,url,params) };
    },
    'the base string should resolve to ': function(fn) {
      return assert.equal(fn('base'),'POST&http%3A%2F%2Fapi.twitter.com%2F1%2Fstatuses%2Fupdate.json&oauth_consumer_key%3DGDdmIQH6jhtmLUypg82g%26oauth_nonce%3DoElnnMTQIZvqvlfXM56aBLAf5noGD0AQR3Fmi7Q6Y%26oauth_signature_method%3DHMAC-SHA1%26oauth_timestamp%3D1272325550%26oauth_token%3D819797-Jxq8aYUDRmykzVKrgoLhXSq67TEa5ruc4GJC2rWimw%26oauth_version%3D1.0%26status%3Dsetting%2520up%2520my%2520twitter%2520%25E7%25A7%2581%25E3%2581%25AE%25E3%2581%2595%25E3%2581%2588%25E3%2581%259A%25E3%2582%258A%25E3%2582%2592%25E8%25A8%25AD%25E5%25AE%259A%25E3%2581%2599%25E3%2582%258B');
    },
    'the signature should resolve to': function(fn) {
      return assert.equal(fn('sign'),'yOahq5m0YjDDjfjxHaXEsW9D+X0=');
    }
  },
})
.addBatch({
  'When accessing a protected resource': {
    topic: function() {
      var consumer = oauth.createConsumer('dpf43f3p2l4k3l03','kd94hf93k423kf44');
          token = oauth.createToken('nnch734d00sl2jdk','pfkkdhi9sl3r4s00');
          hmac = oauth.createHmac(consumer,token);

      var method = 'post',
          url = 'http://api.twitter.com/1/statuses/update.json',
          params = {
            oauth_token:'nnch734d00sl2jdk',
            oauth_consumer_key:'dpf43f3p2l4k3l03',
            oauth_nonce:'CVUoMBFqZET4z34',
            oauth_signature_method:'HMAC-SHA1',
            oauth_timestamp:'1279644048',
            oauth_version:'1.0',
            status: "'Tue Jul 20 2010 18:40:48 GMT+0200 (CEST)'",
          };

      return function(action) { return hmac[action](method,url,params) };
    },
    'the base string should resolve to ': function(fn) {
      assert.equal(fn('base'),'POST&http%3A%2F%2Fapi.twitter.com%2F1%2Fstatuses%2Fupdate.json&oauth_consumer_key%3Ddpf43f3p2l4k3l03%26oauth_nonce%3DCVUoMBFqZET4z34%26oauth_signature_method%3DHMAC-SHA1%26oauth_timestamp%3D1279644048%26oauth_token%3Dnnch734d00sl2jdk%26oauth_version%3D1.0%26status%3D%2527Tue%2520Jul%252020%25202010%252018%253A40%253A48%2520GMT%252B0200%2520%2528CEST%2529%2527');
    },
    'the signature should resolve to': function(fn) {
      assert.equal(fn('sign'),'yDgpCX9QvBQpNxCj7RfbmrSxZCs=');
    }
  },
})
.addBatch({
  'When accessing a protected resource': {
    topic: function() {
      var consumer = oauth.createConsumer('dpf43f3++p+#2l4k3l03','kd9@4h%%4f93k423kf44');
          token = oauth.createToken('nnch734d(0)0sl2jdk','pfkkd#hi9_sl-3r=4s00');
          hmac = oauth.createHmac(consumer,token);

      var method = 'get',
          url = 'http://PHOTOS.example.net:8001/Photos',
          params = {
            oauth_token:'nnch734d(0)0sl2jdk',
            oauth_consumer_key:'dpf43f3++p+#2l4k3l03',
            oauth_nonce:'kllo~9940~pd9333jh',
            oauth_signature_method:'HMAC-SHA1',
            oauth_timestamp:'1191242096',
            oauth_version:'1.0',
            type: '××•×˜×•×‘×•×¡',
            scenario: '×ª××•× ×”',
          };

      return function(action) { return hmac[action](method,url,params) };
    },
    'the base string should resolve to ': function(fn) {
      assert.equal(fn('base'),'GET&http%3A%2F%2Fphotos.example.net%3A8001%2FPhotos&oauth_consumer_key%3Ddpf43f3%252B%252Bp%252B%25232l4k3l03%26oauth_nonce%3Dkllo~9940~pd9333jh%26oauth_signature_method%3DHMAC-SHA1%26oauth_timestamp%3D1191242096%26oauth_token%3Dnnch734d%25280%25290sl2jdk%26oauth_version%3D1.0%26scenario%3D%25C3%2597%25C2%25AA%25C3%2597%25C2%2590%25C3%2597%25E2%2580%25A2%25C3%2597%25C2%25A0%25C3%2597%25E2%2580%259D%26type%3D%25C3%2597%25C2%2590%25C3%2597%25E2%2580%25A2%25C3%2597%25CB%259C%25C3%2597%25E2%2580%25A2%25C3%2597%25E2%2580%2598%25C3%2597%25E2%2580%25A2%25C3%2597%25C2%25A1');
    },
    'the signature should resolve to': function(fn) {
      assert.equal(fn('sign'),'MH9NDodF4I/V6GjYYVChGaKCtnk=');
    }
  },
})
.addBatch({
  'When accessing a protected resource': {
    topic: function() {
      var consumer = oauth.createConsumer('dpf43f3++p+#2l4k3l03','kd9@4h%%4f93k423kf44');
          token = oauth.createToken('nnch734d(0)0sl2jdk','pfkkd#hi9_sl-3r=4s00');
          hmac = oauth.createHmac(consumer,token);

      var method = 'get',
          url = 'http://PHOTOS.example.net:8001/Photos',
          params = {
            oauth_token:'nnch734d(0)0sl2jdk',
            oauth_consumer_key:'dpf43f3++p+#2l4k3l03',
            oauth_nonce:'kllo~9940~pd9333jh',
            oauth_signature_method:'HMAC-SHA1',
            oauth_timestamp:'1191242096',
            oauth_version:'1.0',
            'photo size': '300%',
            title: 'Back of $100 Dollars Bill',
          };

      return function(action) { return hmac[action](method,url,params) };
    },
    'the base string should resolve to ': function(fn) {
      assert.equal(fn('base'),'GET&http%3A%2F%2Fphotos.example.net%3A8001%2FPhotos&oauth_consumer_key%3Ddpf43f3%252B%252Bp%252B%25232l4k3l03%26oauth_nonce%3Dkllo~9940~pd9333jh%26oauth_signature_method%3DHMAC-SHA1%26oauth_timestamp%3D1191242096%26oauth_token%3Dnnch734d%25280%25290sl2jdk%26oauth_version%3D1.0%26photo%2520size%3D300%2525%26title%3DBack%2520of%2520%2524100%2520Dollars%2520Bill');
    },
    'the signature should resolve to': function(fn) {
      assert.equal(fn('sign'),'tTFyqivhutHiglPvmyilZlHm5Uk=');
    }
  },
})
.addBatch({
  'url encoding of hmac key': {
    topic: function() {
      var consumer = oauth.createConsumer('dpf43f3++p+#2l4k3l03','kd9@4h%%4f93k423kf44');
      var token = oauth.createToken('nnch734d(0)0sl2jdk','pfkkd#hi9_sl-3r=4s00');
      var hmac = oauth.createHmac(consumer,token);
      return hmac.key();
    },
    'the key should ': function(topic) {
      assert.equal(topic,'kd9%404h%25%254f93k423kf44&pfkkd%23hi9_sl-3r%3D4s00');
    },
  },
}).export(module);
