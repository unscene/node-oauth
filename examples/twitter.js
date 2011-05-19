//Three legged OAuth example
var oauth = require('../lib/oauth'),
		sys = require('sys'),
		fs = require('fs');

var consumerKey = '';
var consumerSecret = '';

var client = oauth.createClient(443,'api.twitter.com',true);

//oauth setup
var consumer = oauth.createConsumer(consumerKey,consumerSecret);
var token = oauth.createToken();
var signer = oauth.createHmac(consumer);

//endpoints
var requestTokenUrl = '/oauth/request_token';
var accessTokenUrl = '/oauth/access_token';
var authorizeTokenUrl = '/oauth/authorize';

var data = '';
var tokenData = '';

var requestToken = client.request('POST',requestTokenUrl,null,null,signer);
requestToken.end();

requestToken.addListener('response', function (response) {
	response.addListener('data', function (chunk) {	data+=chunk });
	response.addListener('end', onRequestTokenResponse);
});

function onAccessTokenReceived() {
	token.decode(tokenData);
	
	//The body passed in should be an object to both the request and when writing
	//this allows the base string and body to be properly encoded
	var body = { status: 'testing' };
	
	//Note the two extra params, the body and signature
	var request = client.request('POST','/1/statuses/update.json',null,body,signer);

	//The rest of the code is standard node
	var data = '';
		
	request.write(body);
	request.end();	
	
	request.addListener('response', function(response) {
		response.addListener('data',function(chunk) { data+=chunk })
		response.addListener('end',function() { sys.print(sys.inspect(data)); sys.print('\n'); });
	});
}

function onAccessTokenResponse(response) {
	response.addListener('data', function(chunk) { tokenData+=chunk });
	response.addListener('end', onAccessTokenReceived);
}

function onRequestTokenResponse() {
	token.decode(data);
	sys.p(data)
	sys.print('Visit the following website\n');
	sys.print('https://api.twitter.com'+authorizeTokenUrl+'?oauth_token='+token.oauth_token + '\n');
	sys.print('Enter verifier>')

	stream = process.openStdin();
	stream.addListener('data', onVerifierReceived);
}

function onVerifierReceived(chunk) {
	var tokenData = '';
	token.oauth_verifier = chunk.toString('utf8',0,chunk.length-1);
	stream.removeListener('data',arguments.callee);

	signer.token = token;
	var accessToken = client.request('POST',accessTokenUrl,null,null,signer);
	accessToken.addListener('response', onAccessTokenResponse);
	accessToken.end();
}

