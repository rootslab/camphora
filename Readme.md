###Camphora

[![NPM VERSION](http://img.shields.io/npm/v/camphora.svg?style=flat)](https://www.npmjs.org/package/camphora)
[![CODACY BADGE](https://img.shields.io/codacy/b18ed7d95b0a4707a0ff7b88b30d3def.svg?style=flat)](https://www.codacy.com/public/44gatti/camphora)
[![CODECLIMATE](http://img.shields.io/codeclimate/github/rootslab/camphora.svg?style=flat)](https://codeclimate.com/github/rootslab/camphora)
[![CODECLIMATE-TEST-COVERAGE](https://img.shields.io/codeclimate/coverage/github/rootslab/camphora.svg?style=flat)](https://codeclimate.com/github/rootslab/camphora)
[![LICENSE](http://img.shields.io/badge/license-MIT-blue.svg?style=flat)](https://github.com/rootslab/camphora#mit-license)

[![TRAVIS CI BUILD](http://img.shields.io/travis/rootslab/camphora.svg?style=flat)](http://travis-ci.org/rootslab/camphora)
[![BUILD STATUS](http://img.shields.io/david/rootslab/camphora.svg?style=flat)](https://david-dm.org/rootslab/camphora)
[![DEVDEPENDENCY STATUS](http://img.shields.io/david/dev/rootslab/camphora.svg?style=flat)](https://david-dm.org/rootslab/camphora#info=devDependencies)
[![NPM DOWNLOADS](http://img.shields.io/npm/dm/camphora.svg?style=flat)](http://npm-stat.com/charts.html?package=camphora)

[![NPM GRAPH1](https://nodei.co/npm-dl/camphora.png)](https://nodei.co/npm/camphora/)

[![NPM GRAPH2](https://nodei.co/npm/camphora.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/camphora/)

[![status](https://sourcegraph.com/api/repos/github.com/rootslab/camphora/.badges/status.png)](https://sourcegraph.com/github.com/rootslab/camphora)
[![views](https://sourcegraph.com/api/repos/github.com/rootslab/camphora/.counters/views.png)](https://sourcegraph.com/github.com/rootslab/camphora)
[![views 24h](https://sourcegraph.com/api/repos/github.com/rootslab/camphora/.counters/views-24h.png)](https://sourcegraph.com/github.com/rootslab/camphora)

> _**Camphora**_, a tiny module for __NFU__ _(Not Frequently Used)_ __in-memory caching__, with linear _Aging_.

> In this custom implementation:
 - when a new entry is __read or updated__ for the __first time__ its __age__ counter is set to __-1__.
 - if the entry __still exists__, its __age__ will be __decremented by -2__.
 - when a entry ( exisiting or not ) was read or updated, each __age__ counter for the __other entries__,
   will be __incremented by 1__.
 - when the __max capacity__ is reached, the entry with the __highest age__ value will be evicted.
 - when two or more entries have the __same highest age__ value, the entry with the __oldest updateAt__
   value will be chosen for eviction, as for the __LRU__ algorithm.

###Install

```bash
$ npm install camphora [-g]
// clone repo
$ git clone git@github.com:rootslab/camphora.git
```
> __require__:

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

    /*
     * For default, cache keys are encrypted with the same algorithm
     * used for data.
     * Set it to false to use unencrypted/cleartext key names.
     * 
     * NOTE: if encryption is disabled, methods like #get and #peek will accept
     * the same unencrypted argument for the key.
     */
     , encrypt_keys : true
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
 *      , dbytes : Number
 *      , updateAt : Number
 *  }
 *
 * - 'age' indicates the current 'freshness' of the key.
 * - 'key' contains the actual (JSON.stringify) value of the key.
 * - 'kdigest' is the string result of the key encoding.
 * - 'data' contains the current payload associated with the key.
 * - 'ddigest' is the string result of the payload data encoding.
 * - 'dbytes' indicates the current size in bytes of data.
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
      * For default, #load method uses the entire path ( filepath + '/' + filename ) to
      * generate the digest key; this value is used to store file entry into the cache
      * and to retrieve it.
      * If it is set, only the filename will be used to generate the digest key.
      */
      , filepath : null

     /*
      * fs.readFile default options
      * See http://nodejs.org/api/fs.html#fs_fs_readfile_filename_options_callback
      */
      , encoding : null
      , flag : 'r'
 }

Camphora#load = function ( String filename [, Object file_load_opt [, Function cback ] ] ) : undefined

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

> Copyright (c) 2015 &lt; Guglielmo Ferri : 44gatti@gmail.com &gt;

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

[![GA](https://ga-beacon.appspot.com/UA-53998692-1/camphora/Readme?pixel)](https://github.com/igrigorik/ga-beacon)