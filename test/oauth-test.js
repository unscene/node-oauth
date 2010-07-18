var vows = require('vows'),
    assert = require('assert'),
		oauth = require('../lib/oauth'),
		sys = require('sys'),
		qs = require('../lib/querystring'),
		http = require('http');

exports.consumer = vows.describe('Consumer')
	.addBatch({
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
});

exports.token = vows.describe('Token')
	.addBatch({
		'Creating a token': {
			topic: oauth.createToken(),
			'should return a token': function(topic) {
				assert.instanceOf(topic,oauth.Token);
			}
		},
		'Encoding a token': {
			topic: oauth.createToken('key','secret'),
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
});

exports.signatures = vows.describe('Signatures')
	.addBatch({
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
		}
	})

function normalizeUrlTo(url) {
	var context = {
		topic: function() { 
			return oauth.normalizeURL(this.context.name) 
		}
	};

	context['should normalize to ' + url] = function(topic) { 
		return assert.equal(topic,url) 
	};

	return context;
}

exports.utilities = vows.describe('utilities')
	.addBatch({
		'when merging an object': {
			topic: function () { return {a:1}.merge({b:2}) },
			'it should merge everything from the right hand into the left hand': function(topic) {
				assert.deepEqual(topic,{a:1,b:2});
			}
		}
	})
	.addBatch({
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
	})
	.addBatch({
		'https://WWW.test.com:80/RESOURCE?key=value#fragment': normalizeUrlTo('https://www.test.com:80/RESOURCE'),
		'https://www.test.com:80/resource?key=value#fragment': normalizeUrlTo('https://www.test.com:80/resource'),
		'https://www.test.com:443/resource?key=value#fragment': normalizeUrlTo('https://www.test.com/resource'),
		'http://www.test.com:80/resource?key=value#fragment': normalizeUrlTo('http://www.test.com/resource'),
		'http://www.test.com:8080/resource?key=value#fragment': normalizeUrlTo('http://www.test.com:8080/resource'),
		'When path and query string are provided in the request': {
			topic: function () { return oauth.normalizeURL('/resource','www.twitter.com',80,false) },
			'merge hostname and querystring': function(topic) {
				assert.equal(topic,'http://www.twitter.com/resource');
			}
		}
	}).
	addBatch({
		'Parameter pruning RegEx': {
			topic: function () { return /^oauth_\w+$/ },
			'should not match': function(topic) {
				assert.isFalse(/^oauth_\w+$/.test('prop'));
			}
		}
	});