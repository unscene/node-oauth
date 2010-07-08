var vows = require('vows'),
    assert = require('assert'),
		oauth = require('../lib/oauth'),
		sys = require('sys'),
		qs = require('../lib/querystring');

function assertBaseStringAndSignature(baseString,signature) {
	var context = {
		topic: function() {
			
			var req = this.context.title.split(/ +/),
					consumer = oauth.createConsumer(req[0],req[1]),
					token = oauth.createToken(req[2] == 'null' ? null: req[2], 
						req[3] == 'null' ? null: req[3]),
					hmac = oauth.createHmac(consumer,token);
			
			method = req[4];
			url = req[5]
			params = qs.parse(req[6]);
			
			return function(method) { return hmac[action](method,url,params) };
		}
	};
		
	context['base string should resolve to '] = function(fn,baseString) {
		return function(result) {
			return assert.equal(fn('base'),baseString);
		}
	}
	
	context['signature should resolve to '] = function(fn,baseString) {
		return function(result) {
			return assert.equal(fn('sign'),baseString);
		}
	}
	
	return context;
};

function normalizeUrlTo(url) {
	var context = {
		topic: function() { 
			return oauth.Signature.prototype.normalizeURL(this.context.name) 
		}
	};
	
	context['should normalize to ' + url] = function(topic) { 
		return assert.equal(topic,url) 
	};
	
	return context;
}

exports.signatures = vows.describe('Signatures')
	.addBatch({
		//consumer key::consumer secret::token::token secret
		'GDdmIQH6jhtmLUypg82g MCD8BKwGdgPHvAuvgvz4EQpqDAtx89grbuNMRd7Eh98	null null ': {
			//method endpoint
			'POST https://api.twitter.com/oauth/request_token ':{
				//oauth params (k=v&)
				"oauth_callback=http://localhost:3005/the_dance/process_callback?service_provider_id=11&oauth_nonce=QP70eNmVz8jvdPevU3oJD2AfF7R7odC2XJcn4XlZJqk&oauth_signature_method=HMAC-SHA1&oauth_timestamp=1272323042&oauth_version:1.0": 
					assertBaseStringAndSignature(
						"POST&https%3A%2F%2Fapi.twitter.com%2Foauth%2Frequest_token&oauth_callback%3Dhttp%253A%252F%252Flocalhost%253A3005%252Fthe_dance%252Fprocess_callback%253Fservice_provider_id%253D11%26oauth_consumer_key%3DGDdmIQH6jhtmLUypg82g%26oauth_nonce%3DQP70eNmVz8jvdPevU3oJD2AfF7R7odC2XJcn4XlZJqk%26oauth_signature_method%3DHMAC-SHA1%26oauth_timestamp%3D1272323042%26oauth_version%3D1.0",
						"8wUi7m5HFQy76nowoCThusfgB+Q=")
			}
		}
	})
	.addBatch({
		//consumer key::consumer secret::token::token secret
		'GDdmIQH6jhtmLUypg82g MCD8BKwGdgPHvAuvgvz4EQpqDAtx89grbuNMRd7Eh98	8ldIZyxQeVrFZXFOZH5tAwj6vzJYuLQpl0WUEYtWc pDNg57prOHapMbhv25RNf75lVRd6JDsni1AJJIDYoTY x6qpRnlEmW9JbQn4PQVVeVG8ZLPEx6A0TOebgwcuA ': {
			//method endpoint
			'POST https://api.twitter.com/oauth/request_token ':{
				//oauth params (k=v&)
				"oauth_nonce=9zWH6qe0qG7Lc1telCn7FhUbLyVdjEaL3MO5uHxn8&oauth_signature_method=HMAC-SHA1&oauth_timestamp=1272323047&oauth_version:1.0&oauth_verifier=pDNg57prOHapMbhv25RNf75lVRd6JDsni1AJJIDYoTY": 
					assertBaseStringAndSignature(
						"POST&https%3A%2F%2Fapi.twitter.com%2Foauth%2Faccess_token&oauth_consumer_key%3DGDdmIQH6jhtmLUypg82g%26oauth_nonce%3D9zWH6qe0qG7Lc1telCn7FhUbLyVdjEaL3MO5uHxn8%26oauth_signature_method%3DHMAC-SHA1%26oauth_timestamp%3D1272323047%26oauth_token%3D8ldIZyxQeVrFZXFOZH5tAwj6vzJYuLQpl0WUEYtWc%26oauth_verifier%3DpDNg57prOHapMbhv25RNf75lVRd6JDsni1AJJIDYoTY%26oauth_version%3D1.0",
						"PUw/dHA4fnlJYM6RhXk5IU/0fCc=")
			}
		}
	})
	.addBatch({
		//consumer key::consumer secret::token::token secret
		'GDdmIQH6jhtmLUypg82g MCD8BKwGdgPHvAuvgvz4EQpqDAtx89grbuNMRd7Eh98	8ldIZyxQeVrFZXFOZH5tAwj6vzJYuLQpl0WUEYtWc pDNg57prOHapMbhv25RNf75lVRd6JDsni1AJJIDYoTY 819797-Jxq8aYUDRmykzVKrgoLhXSq67TEa5ruc4GJC2rWimw ': {
			//method endpoint
			'POST https://api.twitter.com/oauth/request_token ':{
				//oauth params (k=v&)
				"status=setting up my twitter+私のさえずりを設定する&oauth_nonce=oElnnMTQIZvqvlfXM56aBLAf5noGD0AQR3Fmi7Q6Y&oauth_signature_method=HMAC-SHA1&oauth_timestamp=1272325550&oauth_version:1.0": 
					assertBaseStringAndSignature(
						"POST&https%3A%2F%2Fapi.twitter.com%2Foauth%2Faccess_token&oauth_consumer_key%3DGDdmIQH6jhtmLUypg82g%26oauth_nonce%3D9zWH6qe0qG7Lc1telCn7FhUbLyVdjEaL3MO5uHxn8%26oauth_signature_method%3DHMAC-SHA1%26oauth_timestamp%3D1272323047%26oauth_token%3D8ldIZyxQeVrFZXFOZH5tAwj6vzJYuLQpl0WUEYtWc%26oauth_verifier%3DpDNg57prOHapMbhv25RNf75lVRd6JDsni1AJJIDYoTY%26oauth_version%3D1.0",
						"PUw/dHA4fnlJYM6RhXk5IU/0fCc=")
			}
		}
	})
	.addBatch({
		'when normalizing an object': {
			topic: function () { 
				return oauth.Signature.prototype.normalize(
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
		'Https://WWW.test.com:80/RESOURCE?key=value#fragment': normalizeUrlTo('https://www.test.com:80/resource'),
		'https://www.test.com:80/resource?key=value#fragment': normalizeUrlTo('https://www.test.com:80/resource'),
		'https://www.test.com:443/resource?key=value#fragment': normalizeUrlTo('https://www.test.com/resource'),
		'http://www.test.com:80/resource?key=value#fragment': normalizeUrlTo('http://www.test.com/resource'),
		'http://www.test.com:8080/resource?key=value#fragment': normalizeUrlTo('http://www.test.com:8080/resource')
	});
	
exports.utilities = vows.describe('utilities')
	.addBatch({
		'when merging an object': {
			topic: function () { return {a:1}.merge({b:2}) },
			'it should merge everything from the right hand into the left hand': function(topic) {
				assert.deepEqual({a:1,b:2},topic);
			}
		}
	});