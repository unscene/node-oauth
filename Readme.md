
# Overview
An [OAuth 1.0A](http://oauth.net/core/1.0a/) library for [node.js](http://nodejs.org).  There are currently a handful of OAuth libraries but I choose to take a different route with how the API is used.  The usage is really similar to [simplegeo's python OAuth client](http://github.com/simplegeo/python-oauth2).  It extends the built-in http client which makes signing requests require two extra parameters.  The only difference is that requests must have thier body (if present) and a signature provided, the client takes care of the rest. You are responsible for handling the authentication flow, check out [this example](http://github.com/unscene/node-oauth/blob/master/examples/twitter.js) to see possible uses.

Thanks to [ciaranj](http://github.com/ciaranj/) for providing a place to 
[start](http://github.com/ciaranj/node-oauth).

# Installation
You can be fancy and clone the repo from here, or install [npm](http://github.com/isaacs/npm) and run:

   `npm install oauth-client`

# Tests
Running the tests requires vows.  See [vows](http://vowsjs.org/) to get started.

Once installed:

   `node oauth-test.js`

# Notes

* It severely lacks tests (any help appreciated), but for now the signature base string has a couple
of tests. 
* I had to patch querystring.js to support overriding escape.  qs.stringify was using its internal version of
escape and it made the implementation ugly without being able to override its behavior.


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