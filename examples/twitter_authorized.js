var util = require('util'),
	oauth = require('../lib/oauth');

var consumer = oauth.createConsumer('', '');
var token = oauth.createToken('', '');
var signer = oauth.createHmac(consumer, token);

var body = { 
	status: (''+new Date()) 
}

var request = {
	port: 443,
	host: 'api.twitter.com',
	https: true,
	path: '/1/statuses/update.json',
	oauth_signature: signer,
	method: 'POST',
	body: body
}

debugger;
var request = oauth.request(request, function(response) {
    response.setEncoding('utf8');
    response.on('data', function (chunk) {
      console.log(chunk);
    });
});

request.write(body);
request.end();
