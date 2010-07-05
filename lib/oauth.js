require('./math');

var http = require('http'),
		qs = require('./querystring'),
		url = require('url'),
		crypto = require('crypto')
		sys = require('sys');

var oauth = exports;

exports.version = '1.0';

qs.escape = function(str) { return encodeURIComponent(str).replace(/\%/g,'%25') };

Object.prototype.merge = function(b) {
  if (!b) return this;
  var keys = Object.keys(b)
  for (var i = 0, len = keys.length; i < len; ++i)
    this[keys[i]] = b[keys[i]]
	return this;
};

function sortKeys(obj, fn) {
	if (!obj) return obj;
	var vals = Object.keys(obj).sort(fn)
	var sorted = {}
	for(var i = 0; i < vals.length; i++)
		sorted[vals[i]] = obj[vals[i]]
	obj = sorted
	return obj
}

exports.normalize = function(obj) {
	if(!(obj instanceof Object)) return obj;
	obj = sortKeys(obj);
	for(var prop in obj) {
		if(!obj[prop]) continue
		if(typeof(obj[prop]) === 'function') continue;
		if(obj[prop].constructor === Array) {
			obj[prop] = obj[prop].sort();
			for(var child in obj[prop])
				prop[child] = this.normalize(child);
		}
		else if(obj[prop] instanceof Object)
			obj[prop] = this.normalize(obj[prop]);
	}
	return obj;
};

exports.createClient = function(port, host, secure, creds) {
  var c = http.createClient(port, host, secure, creds);
	var self = this;
	
	c.defaultHeaders = {
		'content-type': 'application/x-www-form-urlencoded',
		'host': host,
		'user-agent': 'node-oauth',
		'accept': '*/*',
		'stream': 'keep-alive',
		'www-authenticate': 'OAuth realm=' + (this.https ? 'https' : 'http') + '://' + host,
		'transfer-encoding': 'chunked'
	}
	
	c.request = function(method, path, headers, body, signature) {
		if (!headers)
			headers = c.defaultHeaders;
		else
			headers.merge(c.defaultHeaders);
			
		if (typeof(path) != "string") {
	    // assume method was omitted, shift arguments
	    headers = url;
	    path = method;
	    method = "GET";
	  }
	
		var base = (this.https ? 'https' : 'http') + '://' + host;
	
		var req = new OAuthRequest(this, base, method, path, headers, body, signature);
	 	c._outgoing.push(req);
		if (this.readyState === 'closed') this._reconnect();

		return req;
	}
	
  return c;
};

function OAuthRequest(socket, base, method, url, headers, body, signature) {
	
	qs.escape = function(str) { return encodeURIComponent(str).replace(/\%/g,'%25') };
	var normalized;
	if (body)  normalized = qs.stringify(body);
	signed = this.signRequest(base, method, url, headers, body, signature);
	
	http.ClientRequest.call(this, socket, method, url, signed);
}
sys.inherits(OAuthRequest,http.ClientRequest);

exports.OAuthRequest = OAuthRequest;

OAuthRequest.prototype.signRequest = function(base, method, path, headers, body, signature) {
	var auth = {
		'oauth_nonce':this.nonce(),
		'oauth_timestamp':this.timestamp(),
		'oauth_signature_method':signature.name,
		'oauth_version':oauth.version
	};
	
	var parsed = url.parse(path);
	removed = this.splitParams(parsed.query);
	
	if (removed) auth.merge(removed);
	
	if (signature.consumer) 
		auth.merge( {'oauth_consumer_key':signature.consumer.oauth_consumer_key} );
	if (signature.token && signature.token.oauth_token) 
		auth.merge( {'oauth_token':signature.token.oauth_token} );
	if (signature.token && signature.token.oauth_verifier) 
		auth.merge( {'oauth_verifier':signature.token.oauth_verifier} );

	var base64;
	var joined = {};
	if (signature instanceof HMAC)
		base64 = signature.sign(method, base + path, body ? joined.merge(body).merge(auth) : auth);
	else if (signature instanceof Plaintext)
		base64 = signature.sign();
	else
		throw new TypeError("Invalid signature type");
	
	qs.escape = function (str) { return encodeURIComponent(str).replace('%20','%2520') };
	auth = qs.stringify(oauth.normalize(auth),'\",','=\"');

	headers['authorization'] = "OAuth " + auth + '\",oauth_signature=\"' + encodeURIComponent(base64) + '\"';
	return headers;
}

OAuthRequest.prototype.nonce = function() {
	return Math.uuid(15)
};

OAuthRequest.prototype.normalizeBody = function(chunk) {
	qs.escape = function(str) { return encodeURIComponent(str).replace('%20','+') }
	normalized = qs.stringify(chunk);
	return normalized;
}

OAuthRequest.prototype.splitParams = function(obj) {
	var removed = null;
	for (var prop in obj)
		if (/^oauth_$/.test(prop)) {
			if(!removed) removed = {};
			removed[prop] = obj[prop];
			delete obj[prop];
		}
	return removed;
};

OAuthRequest.prototype.timestamp = function() {
	return parseInt(new Date().getTime()/1000);
};

OAuthRequest.prototype.write = function(chunk) {
	chunk = this.normalizeBody(chunk);
	return http.ClientRequest.prototype.write.call(this,chunk,'utf8');
}

function Consumer() {};

exports.Consumer = Consumer;

exports.createConsumer = function(key,secret) {
	var c = new Consumer();
	c.oauth_consumer_key = key;
	c.oauth_consumer_secret = secret;
	return c;
};

Consumer.prototype.decode = function(str) {
	var parsed = qs.parse(str);
	for (var prop in parsed) {
		if(this.hasOwnProperty(prop) && parsed[prop] != null)
			this[prop] = parsed[prop];
		else
			this[prop] = null;
	}
};

function Token() {};

exports.Token = Token;

exports.createToken = function(key,secret) {
	var t = new Token();
	t.oauth_token = key || '';
	t.oauth_token_secret = secret || '';
	return t;
};

Token.prototype.decode = function(str) {
	var parsed = qs.parse(str);
	for (var prop in parsed) {
		if(parsed[prop] != null)
			this[prop] = parsed[prop];
		else
			delete this[prop];
	}
};

function HMAC() {};

exports.HMAC = HMAC();

exports.createHMAC = function(consumer,token){
	var h = new HMAC(consumer,token);
	h.algo = 'sha1';
	h.encoding = 'base64';
	h.name = 'HMAC-SHA1';
	h.consumer = consumer;
	h.token = token;
	return h;
};

HMAC.prototype.sign = function(method,path,params) {

	var base = this.base(method,path,params);
	var key =
		(this.consumer ? this.consumer.oauth_consumer_secret : '') + '&' + 
		(this.token ? this.token.oauth_token_secret : '')
	
	var hmac = crypto.createHmac(this.algo,key);
	hmac.update(base);

	return hmac.digest(this.encoding);
};

HMAC.prototype.base = function(method,path,params) {
	if (!this.consumer && !this.token) {
		throw new Error('Must provide a valid consumer or token');
	}
	
	params = qs.stringify(oauth.normalize(params),'%26','%3D');

	return method.toUpperCase() + '&' + encodeURIComponent(path) +
	 	'&' + params;
};

function Plaintext(){};

exports.Plaintext = Plaintext;

exports.createPlaintext = function(consumer,token){
	var p = new PlaintText();	
	p.consumer = consumer;
	p.token = token;
	p.name = 'PLAINTEXT';
	return p;
};

Plaintext.prototype.sign = function() {
	var b = [
		encodeURIComponent(this.consumer.oauth_consumer_secret),
		encodeURIComponent(this.token.oauth_token_secret || '')
	].join('&');

	return b;
}