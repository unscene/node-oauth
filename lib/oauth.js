var http = require('http'),
	querystring = require('querystring'),
	url = require('url'),
	crypto = require('crypto'),
	util = require('util'),
	uuidFast = require('./math').uuidFast;

function merge(a,b) {
	if (!b || !(b instanceof Object))
	{
		return a;
	}
	var keys = Object.keys(b);
	for (var key in keys)
	{
		if(typeof(keys[key]) != 'function')
		{
			a[keys[key]] = b[keys[key]];
		}
	}
	return a;
}

function _encodeURI(str) {
	// https://developer.mozilla.org/En/Core_javascript_1.5_reference:global_functions:encodeuricomponent
	return encodeURIComponent(str).replace(/!/g, '%21').replace(/'/g, '%27').replace(/\(/g, '%28').replace(/\)/g, '%29').replace(/\*/g, '%2A');
}

function Token() {}

exports.Token = Token;

exports.createToken = function(key, secret) {
	var t = new Token();
	t.oauth_token = key || '';
	t.oauth_token_secret = secret || '';
	return t;
};

Token.prototype.decode = function(str) {
	var parsed = querystring.parse(str);
	for(var prop in parsed)
	{
		this[prop] = parsed[prop];
	}
};

Token.prototype.encode = function(str) {
	var ret = { oauth_token: this.oauth_token };

	if(this.oauth_verifier)
	{
		merge(ret, { oauth_verifier: this.oauth_verifier });
	}

	return ret;
};

function Signature(){}

exports.Signature = Signature;

exports.createSignature = function(consumer, token) {
	var p = new Signature();
	p.consumer = consumer;
	p.token = token;
	p.name = 'PLAINTEXT';
	return p;
};

Signature.prototype.key = function() {
	return [
		_encodeURI(this.consumer ? this.consumer.oauth_consumer_secret : ''),
		_encodeURI(this.token ? this.token.oauth_token_secret : '')
	].join('&');
};

Signature.prototype.sign = function() {
	return key;
};

Signature.prototype.baseString = function(method, url, params) {
	querystring.escape = _encodeURI;
	return [
		method.toUpperCase(),
		_encodeURI(oauth.normalizeURL(url)),
		_encodeURI(querystring.stringify(oauth.normalize(params)))
	].join('&');
};

function HMAC() {}

util.inherits(HMAC, Signature);

exports.HMAC = HMAC;

exports.createHmac = function(consumer,token){
	var h = new HMAC(consumer, token);
	h.algo = 'sha1';
	h.encoding = 'base64';
	h.name = 'HMAC-SHA1';
	h.consumer = consumer;
	h.token = token;
	return h;
};

HMAC.prototype.base = function(method,path,params) {
	return this.baseString(method, path, params);
};

HMAC.prototype.sign = function(method,path,params) {
	if (!this.consumer && !this.token)
	{
		throw new Error('Must provide a valid consumer or token');
	}

	var base = this.baseString(method, path, params);
	var hmac = crypto.createHmac(this.algo, this.key());

	hmac.update(base);

	return hmac.digest(this.encoding);
};

function percentEncodeURI(str) {
	return encodeURIComponent(str).replace(/%/g,'%25');
}

function sortKeys (obj, fn) {
	if (!obj)
	{
		return obj;
	}
	var vals = Object.keys(obj).sort(fn);
	var sorted = {};
	for(var i = 0; i < vals.length; i++)
	{
		sorted[vals[i]] = obj[vals[i]];
	}
	obj = sorted;
	return obj;
}


exports.version = '1.0';

function normalize(obj)
{
	if (!(obj instanceof Object))
	{
		return obj;
	}

	obj = sortKeys(obj);
	for(var prop in obj)
	{
		if (typeof(obj[prop]) === 'function')
		{
			delete obj[prop];
			continue;
		}
		if (obj[prop].constructor === Array)
		{
			obj[prop] = obj[prop].sort();
			for(var child in obj[prop])
			{
				prop[child] = oauth.normalize(child);
			}
		}
		else if (obj[prop] instanceof Object)
		{
			obj[prop] = oauth.normalize(obj[prop]);
		}
	}
	return obj;
}

function fillURL(path, host, port, secure)
{
	var p = url.parse(path);
	p.protocol =  p.protocol  || (secure ? 'https:' : 'http:');
	p.hostname =  p.hostname  || host;
	p.port     =  p.port      || port;
	return url.format(p);
}

function normalizeURL(path) {
	var p = url.parse(path.replace(/^https/i, 'https').replace(/^http/i, 'http'));
	var ret = {
		protocol: p.protocol,
		hostname: p.hostname,
		pathname: p.pathname,
		port:     p.port,
		slashes:  true
	};

	if ((p.port == 80 && p.protocol == 'http:') || (p.port == 443 && p.protocol == 'https:'))
	{
		delete ret.port;
	}

	ret.protocol = ret.protocol.toLowerCase();
	ret.hostname = ret.hostname.toLowerCase();

	if (!ret.pathname && !ret.path)
	{
		ret.pathname = ret.path = '/';
	}

	return url.format(ret);
}

exports.request = function(options, callback) {
	if(!options.oauth_signature)
	{
		return http.request(options, callback);
	}

	var default_headers = {
		'content-type': 'application/x-www-form-urlencoded',
		'host': options.host,
		//'user-agent': 'node-oauth',
		'accept': '*/*',
		'www-authenticate': 'OAuth realm=' + (this.https ? 'https' : 'http') + '://' + options.host
	};

	if(!options.headers)
	{
		options.headers = default_headers;
	}
	else
	{
		merge(default_headers, options.headers);
	}

	var uri = fillURL(options.path, options.host, options.port, false);
	options.headers = oauth.signRequest(options.method, uri, options.headers, options.body, options.oauth_signature);

	var req = http.request(options, callback);
	req.write = function(chunk,normalize) {
		if (normalize || options.body)
		{
			chunk = this.normalizeBody(chunk);
		}
		return http.ClientRequest.prototype.write.call(this, chunk, 'utf8');
	};

	return req;
};

function signRequest(method, path, headers, body, signature) {
	var auth = {
		'oauth_nonce':oauth.nonce(),
		'oauth_timestamp':oauth.timestamp(),
		'oauth_signature_method':signature.name,
		'oauth_version':oauth.version
	};

	// split out any oauth_* params in the querystring and merge them into
	// the authorization header
	var parsed = url.parse(path);

	var params = null;
	// if any parameters are passed with the path we need them
	if(parsed.query)
	{
		params = querystring.parse(parsed.query);
	}

	var removed = oauth.splitParams(parsed.query);

	var t = signature.token;
	var c = signature.consumer;

	merge(auth, removed ? removed : null);
	merge(auth, t ? Token.prototype.encode.call(t) : null);
	merge(auth, c ? c.encode() : null);

	var base64;
	var joined = {};

	merge(joined, body ? body : null);
	merge(joined, auth);
	merge(joined, params);

	if (signature instanceof HMAC)
	{
		base64 = signature.sign(method, path, joined);
	}
	else if (signature instanceof Signature)
	{
		base64 = signature.sign();
	}
	else
	{
		throw new TypeError("Invalid signature type");
	}

	var esc = querystring.escape;
	querystring.escape = _encodeURI;
	auth = querystring.stringify(oauth.normalize(auth), '\",', '=\"');
	querystring.escape = esc;

	headers.authorization = "OAuth " + auth + '\",oauth_signature=\"' + _encodeURI(base64) + '\"';
	return headers;
}

function nonce() {
	return uuidFast();
}

function normalizeBody(chunk) {
	var esc = querystring.escape;
	querystring.escape = function(str) { return encodeURIComponent(str).replace('%20','+'); };
	querystring.escape = esc;
	return querystring.stringify(chunk);
}

function splitParams(obj) {
	var removed = null;
	for (var prop in obj)
	{
		if (/^oauth_\w+$/.test(prop))
		{
			if(!removed)
			{
				removed = {};
			}
			removed[prop] = obj[prop];
			delete obj[prop];
		}
	}
	return removed;
}

function timestamp() {
	return (new Date().getTime() / 1000) | 0;
}

function Consumer() {}

exports.Consumer = Consumer;

exports.createConsumer = function(key,secret) {
	var c = new Consumer();
	c.oauth_consumer_key = key;
	c.oauth_consumer_secret = secret;
	return c;
};

Consumer.prototype.decode = function(str) {
	var parsed = querystring.parse(str);
	for (var prop in parsed)
	{
		this[prop] = parsed[prop];
	}
};

Consumer.prototype.encode = function() {
	return {
		oauth_consumer_key: this.oauth_consumer_key
	};
};
