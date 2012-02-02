//Three legged OAuth example
var oauth = require('../lib/oauth'),
	util = require('util'),
	fs = require('fs');

var consumerKey = '';
var consumerSecret = '';

//endpoints
var requestTokenUrl = '/oauth/request_token';
var accessTokenUrl = '/oauth/access_token';
var authorizeTokenUrl = '/oauth/authorize';

//oauth setup
var consumer = oauth.createConsumer(consumerKey,consumerSecret);
var token = oauth.createToken();
var signer = oauth.createHmac(consumer);

var request = {
	port: 443,
	host: 'api.twitter.com',
	https: true,
   	headers: {
    	'Connection': 'Upgrade',
		'Upgrade': 'websocket'
	},
	method: 'POST',
	path: requestTokenUrl,
	oauth_signature: signer
};

var data = '';
var tokenData = '';

util.p(request);

var requestToken = oauth.request(request, function (response) {
	response.on('data', function (chunk) {	data+=chunk });
	
	response.on('end', function() {
	
		token.decode(data);
		util.p(data)
		
		util.print('Visit the following website\n');
		util.print('https://api.twitter.com'+authorizeTokenUrl+'?oauth_token='+token.oauth_token + '\n');
		util.print('Enter verifier>')

		stream = process.openStdin();
		stream.addListener('data', function() {		
			token.oauth_verifier = chunk.toString('utf8',0,chunk.length-1);
			stream.removeListener('data',arguments.callee);

			signer.token = token;
			
			request.path = accessTokenUrl
			var accessToken = client.request(request, function(response) {
				response.addListener('data', function(chunk) { tokenData+=chunk });
				response.addListener('end', function() {
					
					token.decode(tokenData);
						
					var body = { status: 'testing' };
					
					request.path = '/1/statuses/update.json';
					request.body = body;
					
					var r = client.request(request, function(response){
						response.on('data',function(chunk) { data+=chunk })
						response.on('end',function() { util.print(util.inspect(data)); util.print('\n'); });
					});
					
					//The rest of the code is standard node
					var data = '';
		
					request.write(body);
					request.end();	
					
				});				
			});
			
			accessToken.end();			
		});
	});
});

requestToken.end();