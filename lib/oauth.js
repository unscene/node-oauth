require('./math');

var http = require('http'),
		qs = require('./querystring'),
		url = require('url'),
		crypto = require('crypto')
		sys = require('sys');

var oauth = exports;

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

qs.escape = function(str) { return encodeURIComponent(str).replace(/\%/g,'%25') };

exports.version = '1.0';

exports.normalize = function(obj) {
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
				prop[child] = oauth.normalize(child);
		}
		else if (obj[prop] instanceof Object)
			obj[prop] = oauth.normalize(obj[prop]);
	}
	return obj;
};

exports.normalizeURL = function(req, host, port, secure) {
	var p = url.parse(req.toLowerCase());
	
	return url.format({
		protocol: p.protocol || (secure ? 'https:' : 'http:'),
		hostname: p.hostname || host,
		pathname: p.pathname,
		port: (((p.port == 80 && p.protocol == 'http:') || 
		 	(p.port == 443 && p.protocol == 'https:')) ? null : p.port)
	});
}

exports.createClient = function(port, host, secure, creds) {
  var c = http.createClient(port, host, secure, creds);
	
	c.defaultHeaders = {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Host': host,
    'User-Agent': 'node-oauth',
    'Accept': '*/*',
    'WWW-Authenticate': 'OAuth realm=' + (this.https ? 'https' : 'http') + '://' + host,
	}
	
	c.request = function(method, path, headers, body, signature) {
		if (!headers)
			headers = c.defaultHeaders;
		else
			c.defaultHeaders.merge(headers);

		if (typeof(path) != "string") {
	    headers = url;
	    path = method;
	    method = "GET";
	  }
	  
	  if (body)
	    this.hasBody = true;
		
		path = oauth.normalizeURL(path, host, port, secure);

		var req = new Request(this, method, path, headers, body, signature);
	 	c._outgoing.push(req);
		if (this.readyState === 'closed') this._reconnect();

		return req;
	}
	
  return c;
};

function Request(socket, method, path, headers, body, signature) {
	signed = this.signRequest(method, path, headers, body, signature);
	http.ClientRequest.call(this, socket, method, path, signed);
}
sys.inherits(Request,http.ClientRequest);

exports.Request = Request;

Request.prototype.signRequest = function(method, path, headers, body, signature) {
	var auth = {
		'oauth_nonce':this.nonce(),
		'oauth_timestamp':this.timestamp(),
		'oauth_signature_method':signature.name,
		'oauth_version':oauth.version
	};
	
	//split out any oauth_* params in the querystring and merge them into
	// the authorization header
	var parsed = url.parse(path);
	removed = this.splitParams(parsed.query);	
	
	var t = signature.token;
	var c = signature.consumer;
	
	auth
		.merge(removed ? removed : null)
		.merge(t ? t.encode() : null)
		.merge(c ? c.encode() : null);
	
	var base64;
	var joined = {};
	if (signature instanceof HMAC)
		base64 = signature.sign(method, path, body ? joined.merge(body).merge(auth) : auth);
	else if (signature instanceof Signature)
		base64 = signature.sign();
	else
		throw new TypeError("Invalid signature type");
	
	qs.escape = function (str) { return encodeURIComponent(str).replace(/\%/g,'%25') };
	auth = qs.stringify(oauth.normalize(auth),'\",','=\"');

	headers['Authorization'] = "OAuth " + auth + '\",oauth_signature=\"' + encodeURIComponent(base64) + '\"';
	return headers;
}

Request.prototype.nonce = function() {
	return Math.uuid(15)
};

Request.prototype.normalizeBody = function(chunk) {
	qs.escape = function(str) { return encodeURIComponent(str).replace('%20','+') }
	return qs.stringify(chunk);
};

Request.prototype.splitParams = function(obj) {
	var removed = null;
	for (var prop in obj)
		if (/^oauth_\w+$/.test(prop)) {
			if(!removed) removed = {};
			removed[prop] = obj[prop];
			delete obj[prop];
		}
	return removed;
};

Request.prototype.timestamp = function() {
	return parseInt(new Date().getTime()/1000);
};

Request.prototype.write = function(chunk,normalize) {
	if (normalize || this.socket.hasBody)
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
	for (var prop in parsed)
			this[prop] = parsed[prop];
};

Consumer.prototype.encode = function() {
  return {
    oauth_consumer_key:this.oauth_consumer_key
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
	for (var prop in parsed)
			this[prop] = parsed[prop];
};

Token.prototype.encode = function(str) {
	var ret = {
	  oauth_token:this.oauth_token
	}
	
	if (this.oauth_verifier) 
	  ret.merge({oauth_verifier:this.oauth_verifier});
	
	return ret;
}

function Signature() {};

exports.Signature = Signature;

exports.createSignature = function(consumer,token){
	var p = new PlaintText();	
	p.consumer = consumer;
	p.token = token;
	p.name = 'PLAINTEXT';
	return p;
};

Signature.prototype.key = function () {
	return [
		this.consumer ? this.consumer.oauth_consumer_secret : '',
		this.token ? this.token.oauth_token_secret : ''
	].join('&');
};

Signature.prototype.sign = function() {
	return key;
};

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

HMAC.prototype.base = function(method,path,params) {
	if (!this.consumer && !this.token) 
		throw new Error('Must provide a valid consumer or token');

	return [
		method.toUpperCase(),
		encodeURIComponent(path),
		qs.stringify(oauth.normalize(params),'%26','%3D')
	].join('&');
};

HMAC.prototype.sign = function(method,path,params) {	
	var base = this.base(method,path,params);
	var hmac = crypto.createHmac(this.algo,this.key());
  
	hmac.update(base);

	return hmac.digest(this.encoding);
};