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
	    headers = url;
	    path = method;
	    method = "GET";
	  }

		var req = new OAuthRequest(this, method, path, headers, body, signature);
	 	c._outgoing.push(req);
		if (this.readyState === 'closed') this._reconnect();

		return req;
	}
	
  return c;
};

function OAuthRequest(socket, method, path, headers, body, signature) {
	qs.escape = function(str) { return encodeURIComponent(str).replace(/\%/g,'%25') };

	if (body)  body = qs.stringify(body);
	signed = this.signRequest(method, path, headers, body, signature);
	
	http.ClientRequest.call(this, socket, method, path, signed);
}
sys.inherits(OAuthRequest,http.ClientRequest);

exports.OAuthRequest = OAuthRequest;

OAuthRequest.prototype.signRequest = function(method, path, headers, body, signature) {
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
		base64 = signature.sign(method, path, body ? joined.merge(body).merge(auth) : auth);
	else if (signature instanceof Plaintext)
		base64 = signature.sign();
	else
		throw new TypeError("Invalid signature type");
	
	qs.escape = function (str) { return encodeURIComponent(str).replace(/\%/g,'%25') };
	auth = qs.stringify(oauth.normalize(auth),'\",','=\"');

	headers['authorization'] = "OAuth " + auth + '\",oauth_signature=\"' + encodeURIComponent(base64) + '\"';
	return headers;
}

OAuthRequest.prototype.nonce = function() {
	return Math.uuid(15)
};

OAuthRequest.prototype.normalizeBody = function(chunk) {
	qs.escape = function(str) { return encodeURIComponent(str).replace('%20','+') }
	return qs.stringify(chunk);
};

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
};

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

function Signature() {};

exports.Signature = Signature;

Signature.prototype.normalize = function(obj) {
	if (!(obj instanceof Object)) return obj;
	obj = sortKeys(obj);
	for(var prop in obj) {
		if (typeof(obj[prop]) === 'function') { 
			delete obj[prop];
			continue;
		}
		if (obj[prop].constructor === Array) {
			obj[prop] = obj[prop].sort();
			for(var child in obj[prop])
				prop[child] = this.normalize(child);
		}
		else if (obj[prop] instanceof Object)
			obj[prop] = this.normalize(obj[prop]);
	}
	return obj;
};

Signature.prototype.normalizeURL = function(str) {
	var p = url.parse(str,false);
	
	return url.format({
		protocol: p.protocol,
		hostname: p.hostname,
		pathname: p.pathname,
		port: ((p.port == 80 && p.protocol == 'http:') || 
		 	(p.port == 443 && p.protocol == 'https:')) ? null : p.port
	}).toLowerCase();
}

function HMAC() {};

sys.inherits(HMAC,Signature);

exports.HMAC = HMAC;

exports.createHmac = function(consumer,token){
	var h = new HMAC(consumer,token);
	h.algo = 'sha1';
	h.encoding = 'base64';
	h.name = 'HMAC-SHA1';
	h.consumer = consumer;
	h.token = token;
	return h;
};

HMAC.prototype.sign = function(method,path,params) {
	path = this.normalizeURL(path);
	
	var base = this.base(method,path,params);

	var key = [
		this.consumer ? this.consumer.oauth_consumer_secret : '',
		this.token ? this.token.oauth_token_secret : ''
	].join('&')
	
	var hmac = crypto.createHmac(this.algo,key);
	hmac.update(base);

	return hmac.digest(this.encoding);
};

HMAC.prototype.base = function(method,path,params) {
	if (!this.consumer && !this.token) 
		throw new Error('Must provide a valid consumer or token');

	return [
		method.toUpperCase(),
		encodeURIComponent(path),
		qs.stringify(this.normalize(params),'%26','%3D')
	].join('&');
};

function Plaintext(){};

sys.inherits(Plaintext,Signature);

exports.Plaintext = Plaintext;

exports.createPlaintext = function(consumer,token){
	var p = new PlaintText();	
	p.consumer = consumer;
	p.token = token;
	p.name = 'PLAINTEXT';
	return p;
};

Plaintext.prototype.sign = function() {
	return [
		encodeURIComponent(this.consumer.oauth_consumer_secret || ''),
		encodeURIComponent(this.token.oauth_token_secret || '')
	].join('&');
}