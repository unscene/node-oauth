
# Overview
An [OAuth 1.0A](http://oauth.net/core/1.0a/) library for [node.js](http://nodejs.org).  There are currently a handful of OAuth libraries but I choose to take a different route with how the API is used.  The usage is really similar to [simplegeo's python OAuth client](http://github.com/simplegeo/python-oauth2).  It extends the built-in http client which makes signing requests require two extra parameters.  The only difference is that requests must have thier body (if present) and a signature provided, the client takes care of the rest. You are responsible for handling the authentication flow, check out [this example](http://github.com/unscene/node-oauth/blob/master/examples/twitter.js) to see possible uses.

Thanks to [ciaranj](http://github.com/ciaranj/) for providing a place to 
[start](http://github.com/ciaranj/node-oauth).

# Installation
You can be fancy and clone the repo from here, or install [npm](http://github.com/isaacs/npm) and run:

	npm install oauth-client

The include you must specify, if using the npm install:

	require('oauth-client')

Otherwise:

	require('oauth')

#Usage

See the example.

## Sending request
Sending requests works very similar to the latest version of node's built-in http library.

	var request = {
		port: 443,
		host: 'api.twitter.com',
		https: true,
		path: '/1/statuses/update.json',
		oauth_signature: signer,
		method: 'POST',
		body: body
	}
	
	request = oauth.request(request, function(response) { ... });
	req.write(body);
	req.end();
	
The only two difference here between the built-in client and this one, is that you must include 'https: true' and the 'body' must be included in the request options.  You must include it so that the base string can be calculated correctly. There are a set of default headers included but you can override them by simply providing your own, your headers get merged into the defaults.  Be sure to include the same body as you specified in the request, this way you can still stream the body.

If you must specify your own oauth_* parameters put them in the query string:

	var request = {
		port: 443,
		host: 'api.twitter.com',
		https: true,
		path: '/something?oauth_callback=oob',
		oauth_signature: signer,
		method: 'POST',
		body: body
	}

These params get split out and included in the authorization header.	

## Signatures

That last parameter is the only portion that takes some setup.  This is the piece that calculates and signed your requests.  There are two types provided: Plaintext & HMAC-SHA1 (RSA in the future maybe)

	var consumer = oauth.createConsumer('key','secret');
	var signer = oauth.createHmac(consumer);
	
	var request = {
		..
		oauth_signature: signer,
		..
	}
	
	client.request(request, function(response) { ... });

If you have an authorized or unauthorized token you can provide that to the createHMAC constructor as well.
You just need to provide the type of signature you want along with the consumer and tokens, requests get automatically signed.

## Consumers and Tokens

Consumers and tokens both have a utility method decode() that will take an http response and collect the form encoded responses.

	var data = ''
	
	oauth.request(request, function(response)){
		response.on('data', function (chunk) {	data+=chunk });
		response.on('end', function () {
			token.decode(data);
		});
	});

# Tests
See [vows](http://vowsjs.org/) to get started.

Once installed:

	vows tests/*

## License 

(The MIT License)

Copyright (c) 2009 Ryan Fairchild &lt;ryan.fairchild [at] gmail [dot] com&gt;

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.