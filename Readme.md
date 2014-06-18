###Camphora
[![build status](https://secure.travis-ci.org/rootslab/camphora.png?branch=master)](http://travis-ci.org/rootslab/camphora) 
[![NPM version](https://badge.fury.io/js/camphora.png)](http://badge.fury.io/js/camphora)
[![build status](https://david-dm.org/rootslab/camphora.png)](https://david-dm.org/rootslab/camphora)

[![NPM](https://nodei.co/npm/camphora.png?downloads=true&stars=true)](https://nodei.co/npm/camphora/)

[![NPM](https://nodei.co/npm-dl/camphora.png)](https://nodei.co/npm/camphora/)

> _**Camphora**_, a tiny module for __NFU__ _(Not Frequently Used)_ __in-memory caching__, with linear _Aging_.

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
     * Set the max number of entries in the cache.
     * When this value will be reached, an element with the highest "age"
     * among others, will be evicted from the cache.
     *
     * NOTE: 'capacity' is not related to the cache size in bytes.
     */
    , capacity : 1024

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
    , algorithm : 'sha1'

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
}
```

###Properties

```javascript
/*
 * An object/hash that holds cached objects.
 * Every cache entry is an object/hash:
 *
 * 'kdigest' : {
 *      age : Number
 *      , key : String
 *      , kdigest : String
 *      , data : Buffer | String | null
 *      , ddigest : String | null
 *      , bytes : Number
 *      , updateAt : Number
 *  }
 *
 * - 'age' indicates the current 'freshness' of the key.
 * - 'key' contains the actual (JSON.stringify) value of the key.
 * - 'kdigest' is the string result of the key encoding.
 * - 'data' contains the current payload associated with the key.
 * - 'ddigest' is the string result of the payload data encoding.
 * - 'bytes' indicates the current size in bytes of data.
 * - 'updatedAt' holds the last access timestamp.
 */
Camphora.cache

/*
 * An object/hash that holds current options.
 */
Camphora.options

```

###Methods

> Arguments within [ ] are optional, '|' indicates multiple type for an argument.

```javascript
/*
 * Load a file entry into the cache.
 * It returns the new or updated object entry.
 * Default options are:
 */
 file_load_opt = {
     /*
      * For default, #load method saves the file data
      * and its resulting digest into the cache.
      * If it set to false, only data digest will be stored.
      */
      payload : true

     /*
      * For default, #load method uses the entire file path to generate
      * the digest key ( used to store/retrieve this file entry into the
      * cache ).
      * If it is set to true, only basename will be used ( last portion
      * of the path ).
      */
      , basename : false

     /*
      * fs.readFile default options
      * See http://nodejs.org/api/fs.html#fs_fs_readfile_filename_options_callback
      */
      , encoding : null
      , flag : 'r'
 }

Camphora#load = function ( String file_path [, Object file_load_opt [, Function cback ] ] ) : Object

/*
 * Read or Create an object/key entry into the cache, without payload data.
 * It returns the new or updated object entry. 
 *
 * NOTE: 'key' argument will be converted with JSON.stringify().
 *
 * NOTE: It affects 'age' properties in the cache.
 */
Camphora#read = function ( Object key ) : Object

/*
 * Update or Create an object/key entry into the cache, optionally specifying
 * additional payload data.
 * It returns the new or updated object entry. 
 *
 * NOTE: 'key' argument will be converted with JSON.stringify().
 *
 * NOTE: It affects 'age' properties in the cache.
 */
Camphora#update = function ( Object key [, Buffer payload | String payload ] ) : Object

/*
 * Evict a key/object entry from the cache.
 * It returns true if entry exists, false otherwise.
 *
 * NOTE: 'key' argument will be converted with JSON.stringify().
 */
Camphora#evict = function ( Object key ) : Boolean

/*
 * Peek an object/key entry from the cache.
 * It returns the Object entry, or undefined if it doesn't exist.
 *
 * NOTE: It doesn't affect 'age' properties in the cache.
 *
 * NOTE: 'key' argument will be converted with JSON.stringify().
 */
Camphora#peek = function ( Object key ) : Object

/*
 * Get an object/key entry from the cache, using its actual encoded value.
 * It returns the Object entry, or undefined if it doesn't exist.
 *
 * NOTE: It doesn't affect 'age' properties in the cache.
 */
Camphora#get = function ( String encoded_key ) : Object

/*
 * Delete a key/object entry from the cache, using its actual encoded value.
 * It returns true if entry exists, false otherwise.
 */
Camphora#delete = function ( String encoded_key ) : Boolean

/*
 * Clear the cache.
 * It returns the current number of entries evicted.
 */
Camphora#clear = function () : Number

/*
 * Reset age properties for all entries in the cache.
 * It returns the current number of entries updated.
 */
Camphora#reset = function () : Number

/*
 * Get the current cache size.
 * It returns an Array:
 * [ Number total_number_of_entries, Number total_bytes_of_payload_data ]
 */
Camphora#size = function () : Array

/*
 * Get all the ( encoded ) keys in the cache.
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