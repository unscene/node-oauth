var sys = require('sys');
var oauth = require('oauth');

// if you already have the access token and secret…
var key = '';
var secret = '';

var atoken = "";
var asecret = "";

var client = oauth.createClient(443,'api.twitter.com',true);
var consumer = oauth.createConsumer(key, secret);
var token = oauth.createToken(atoken, asecret);
var signer = oauth.createHmac(consumer, token);

var body = { status: (''+new Date()) };
var request = client.request('POST','/1/statuses/update.json',null,body,signer);
request.write(body);

request.addListener('response', function(response) {
    console.log('STATUS: ' + response.statusCode);
    console.log('HEADERS: ' + JSON.stringify(response.headers));
    response.setEncoding('utf8');
    response.addListener('data', function (chunk) {
      console.log('BODY: ' + chunk);
    });
});
request.end();
