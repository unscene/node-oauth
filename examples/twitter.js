//Three legged OAuth example
var oauth = require('../lib/oauth'),
		sys = require('sys'),
		fs = require('fs');

var consumerKey = 'your_consumer_key';
var consumerSecret = 'your_consumer_secret';

//Read in the tokens file so when running the example
//you don't have to keep requesting an authorized access token
fs.readFile(__dirname + '/tokens', function(err,data) {
	if (err) getToken();
	else testRequest(data);
})

function testRequest(data) {
	
	var client = oauth.createClient(443,'api.twitter.com',true);
	
	data = data.toString().split(' ');

	//oauth setup, done once
	var consumer = oauth.createConsumer(consumerKey,consumerSecret);
	var token = oauth.createToken(data[0],data[1]);
	var signer = oauth.createHMAC(consumer,token);
	
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

function getToken() {
	var client = oauth.createClient(443,'api.twitter.com',true);
	
	//oauth setup
	var consumer = oauth.createConsumer(consumerKey,consumerSecret);
	var token = oauth.createToken();
	var signer = oauth.createHMAC(consumer);

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
	
	this.onAccessTokenReceived = function() {
		token.decode(tokenData);

		var tokenFile = __dirname + '/tokens';
		var entry = token.oauth_token + ' ' + token.oauth_token_secret;

		fs.open(tokenFile, 'w', function(err,fd) { 
			if (err) sys.error(err);	
			else fs.close(fd,tokenFile);
		});
			
		fs.writeFile(tokenFile, entry, function(err) { 
			if(err) sys.error(err) 
			
			sys.print('Wrote token to file, exit and rerun to post to twitter\n');
		});
	}
	
	this.onAccessTokenResponse = function(response) {
		response.addListener('data', function(chunk) { tokenData+=chunk });
		response.addListener('end', onAccessTokenReceived);
	}
	
	this.onRequestTokenResponse = function() {
		token.decode(data);

		sys.print('Visit the following website\n');
		sys.print('https://api.twitter.com'+authorizeTokenUrl+'?oauth_token='+token.oauth_token + '\n');
		sys.print('Enter verifier>')

		stream = process.openStdin();
		stream.addListener('data', onVerifierReceived);
	}
	
	this.onVerifierReceived = function(chunk) {
		var tokenData = '';
		token.oauth_verifier = chunk.toString('utf8',0,chunk.length-1);
		stream.removeListener('data',arguments.callee);

		signer.token = token;
		var accessToken = client.request('POST',accessTokenUrl,null,null,signer);
		accessToken.addListener('response', onAccessTokenResponse);
		accessToken.end();
	}
}
