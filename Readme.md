###Camphora
[![build status](https://secure.travis-ci.org/rootslab/camphora.png?branch=master)](http://travis-ci.org/rootslab/camphora) 
[![NPM version](https://badge.fury.io/js/camphora.png)](http://badge.fury.io/js/camphora)

[![NPM](https://nodei.co/npm/camphora.png?downloads=true&stars=true)](https://nodei.co/npm/camphora/)

[![NPM](https://nodei.co/npm-dl/camphora.png)](https://nodei.co/npm/camphora/)

> _**Camphora**_, a tiny module for __NFU__ _(Not Frequently Used)_ __caching__, with linear Aging.

###Install

```bash
$ npm install camphora [-g]
// clone repo
$ git clone git@github.com:rootslab/camphora.git
```
> __require__ 

```javascript
var Camphora = require( 'camphora' );
```
> See [examples](example/).

###Run Tests

```bash
$ cd camphora/
$ npm test
```
###Constructor

> Create an instance, the argument within [ ] is optional.

```javascript
Camphora( [ Object opt ] )
// or
new Camphora( [ Object opt ] )
```

####Options

> Default options are listed.

```javascript
opt = {
    /*
     * Choose an algorithm to encode objects into keys. 
     *
     * NOTE: Algorithm is dependent on the available algorithms
     * supported by the version of OpenSSL on the platform.
     * Examples are 'sha1', 'md5', 'sha256', 'sha512', etc.
     * On recent releases, openssl list-message-digest-algorithms
     * will display the available digest algorithms.
     * See http://nodejs.org/api/crypto.html#crypto_crypto_createhash_algorithm.
     */
    algorithm : 'sha1'
    /*
     * Choose a particular encoding for the digest/key. 
     *
     * NOTE: The encoding can be 'hex', 'binary' or 'base64'.
     * If no encoding is provided, then a buffer is returned.
     * See http://nodejs.org/api/crypto.html#crypto_hash_digest_encoding
     */
    , output_encoding : 'hex'
    /*
     * Change how the input encoding will be intepreted.
     *
     * NOTE: set the encoding of the given input, it can be 'utf8', 'ascii'
     * or 'binary'. If no encoding is provided and the input is a string,
     * an encoding of 'binary' is enforced.
     * If data is a Buffer then input_encoding is ignored.
     * See http://nodejs.org/api/crypto.html#crypto_hash_update_data_input_encoding
     */
    , input_encoding : 'binary'
    /*
     * Set the max number of entries in the cache.
     * When this value will be reached, an element with the highest "age"
     * among others, will be evicted from the cache.
     *
     * NOTE: 'capacity' is not related to the cache size in bytes.
     */
    , capacity : 1024
    /*
     * In some particular situations, you need to hold in the cache only
     * the encoded keys, not their real values, use "false" in these cases.
     */
    , values : true
}
```

###Properties

```javascript
/*
 * An object/hash that holds cached objects.
 * Every cache entry is an object/hash:
 *
 * 'encoded_key' : {
 *      age : Number
 *      , value : String
 *      , bytes : Number
 *  }
 *
 * - 'encoded_key' is the string result of the key encoding.
 * - 'age' indicates the current 'freshness' of the key.
 * - 'value' contains the actual (JSON.stringify) value of the key.
 * - 'bytes' contains the current size in bytes of the cached key.
 */
Camphora.cache

/*
 * An object/hash that holds current options.
 */
Camphora.options

```

###Methods

> Arguments within [ ] are optional.

```javascript
/*
 * Create or update an entry in the cache.
 * 
 * NOTE: 'key' argument will be converted to a String
 * with JSON.stringify().
 *
 * Example:
 *
 * key = { prop0 : 'value0' }
 *
 * executing Camphora#update( key ) returns an object/hash:
 * 
 * {
 *  key: '{"prop0":"value0"}'
 *  , digest: 'cc41f3c16f32cec48945602edb342c7c96784b6f'
 *  , entries: 4
 *  , bytes: 72
 * }
 *
 */
Camphora#update = function ( Object key ) : Object

/*
 * Evict an key/object from cache, passing the object
 * itself.
 * It returns true if entry exists, false otherwise.
 *
 * NOTE: 'key' argument will be converted to a String
 * with JSON.stringify().
 */
Camphora#evict = function ( Object key ) : Boolean

/*
 * Delete an entry with its actual encoded name.
 * It returns true if entry exists, false otherwise.
 */
Camphora#delete = function ( String key ) : Boolean

/*
 * Clear the cache.
 * It returns the current number of entries evicted.
 */
Camphora#clear = function () : Number

/*
 * Peek a key(object) in the cache, passing the object itself,
 * It returns the Object entry, or undefined if it doesn't exist.
 *
 * NOTE: It doesn't affect 'age' properties in the cache.
 *
 * NOTE: 'key' argument will be converted to a String
 * with JSON.stringify().
 */
Camphora#peek = function ( Object key ) : Object

/*
 * Get a key in the cache with its actual encoded name.
 * It returns the Object entry, or undefined if it doesn't exist.
 *
 * NOTE: It doesn't affect 'age' properties in the cache.
 */
Camphora#get = function ( String key ) : Object

/*
 * Get the current cache size.
 * It returns an Array like [ Number length, Number bytes ]
 * respectively the number of keys/entries and the total size
 * in bytes of values ( if any esist ).
 */
Camphora#size = function () : Array

/*
 * Get all the keys in the cache.
 */
Camphora#keys = function () : Array
```

------------------------------------------------------------------------


### MIT License

> Copyright (c) 2014 &lt; Guglielmo Ferri : 44gatti@gmail.com &gt;

> Permission is hereby granted, free of charge, to any person obtaining
> a copy of this software and associated documentation files (the
> 'Software'), to deal in the Software without restriction, including
> without limitation the rights to use, copy, modify, merge, publish,
> distribute, sublicense, and/or sell copies of the Software, and to
> permit persons to whom the Software is furnished to do so, subject to
> the following conditions:

> __The above copyright notice and this permission notice shall be
> included in all copies or substantial portions of the Software.__

> THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
> EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
> MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
> IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
> CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
> TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
> SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.