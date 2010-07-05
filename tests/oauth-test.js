var vows = require('vows'),
    assert = require('assert'),
		oauth = require('../lib/oauth');
		
var suite = vows.describe('oauth').addBatch({
	'Creating an HMAC': {
			'with a consumer and a token': {
				topic: 
					function () {
						var c = oauth.createConsumer('GDdmIQH6jhtmLUypg82g','MCD8BKwGdgPHvAuvgvz4EQpqDAtx89grbuNMRd7Eh98');
					
						return oauth.createHMAC(c,null);
					},

				'then generating a base string': {
					topic: 
						function(hmac) {
							return hmac.base('post','https://api.twitter.com/oauth/request_token',
								{
									oauth_callback: 'http://localhost:3005/the_dance/process_callback?service_provider_id=11',
									oauth_consumer_key: 'GDdmIQH6jhtmLUypg82g',
									oauth_nonce:'QP70eNmVz8jvdPevU3oJD2AfF7R7odC2XJcn4XlZJqk',
									oauth_signature_method:'HMAC-SHA1',
									oauth_timestamp:'1272323042',
									oauth_version:'1.0'
								});	
						},
						'returns a concatenated, parameter sorted, percent-encoded string':
							function(result) {
								assert.equal(result,'POST&https%3A%2F%2Fapi.twitter.com%2Foauth%2Frequest_token&oauth_callback%3Dhttp%253A%252F%252Flocalhost%253A3005%252Fthe_dance%252Fprocess_callback%253Fservice_provider_id%253D11%26oauth_consumer_key%3DGDdmIQH6jhtmLUypg82g%26oauth_nonce%3DQP70eNmVz8jvdPevU3oJD2AfF7R7odC2XJcn4XlZJqk%26oauth_signature_method%3DHMAC-SHA1%26oauth_timestamp%3D1272323042%26oauth_version%3D1.0');
							}
				},
				'then signing': {
					topic:
						function(hmac) {
							return hmac.sign('post','https://api.twitter.com/oauth/request_token',
								{
									oauth_callback: 'http://localhost:3005/the_dance/process_callback?service_provider_id=11',
									oauth_consumer_key: 'GDdmIQH6jhtmLUypg82g',
									oauth_nonce:'QP70eNmVz8jvdPevU3oJD2AfF7R7odC2XJcn4XlZJqk',
									oauth_signature_method:'HMAC-SHA1',
									oauth_timestamp:'1272323042',
									oauth_version:'1.0'
								});
						},
						'returns a valid base-64 encoded string':
							function(result) {
								assert.equal(result,'8wUi7m5HFQy76nowoCThusfgB+Q=');
							}
				}
			},
			'without a consumer and token': { 
				topic: 
						oauth.createHMAC(null,null),
						'then signed with a method, path and normalized parameter string': {
							topic: 
								function(hmac) {
									return function () { 
										return hmac.sign(
											'get',
											'http://photos.example.net/photos',
											'file=vacation.jpg&oauth_consumer_key=dpf43f3p2l4k3l03&oauth_nonce=kllo9940pd9333jh&oauth_signature_method=HMAC-SHA1&oauth_timestamp=1191242096&oauth_token=nnch734d00sl2jdk&oauth_version=1.0&size=original'
										) 
									};	
								},
								'throws an Error': 
									function(result) {
										assert.throws(result,Error);
									}
						}
			}
	}
}).run();