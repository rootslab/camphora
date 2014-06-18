/*
 * Camphora, a tiny module for NFU (Not Frequently Used)
 * in-memory caching, with linear Aging.
 *
 * Copyright(c) 2014 Guglielmo Ferri <44gatti@gmail.com>
 * MIT Licensed
 */

exports.version = require( '../package' ).version;
exports.Camphora = ( function () {
    var log = console.log
        , crypto = require( 'crypto' )
        , fs = require( 'fs' )
        , util = require( 'util' )
        , path = require( 'path' )
        , Bolgia = require( 'bolgia' )
        , emptyFn = function () {}
        , toString = Bolgia.toString
        , improve = Bolgia.improve
        , ooo = Bolgia.circles
        , ostr = ooo.str
        , ofun = ooo.fun
        , okeys = Object.keys
        , min = Math.min
        , isBuffer = Buffer.isBuffer
        , bblen = Buffer.byteLength
        , createHash = crypto.createHash
        , stringify = JSON.stringify
        // produce a digest
        , getDigest = function ( key, cfg ) {
            var algo = cfg.algorithm
                , oenc = cfg.output_encoding
                , ienc = cfg.input_encoding
                , k = toString( key ) !== ostr ? stringify( key ) : key
                , digest = createHash( algo ).update( k, ienc ).digest( oenc )
                ;
            return digest;
        }
        // update cache with a fresh key
        , updateAge = function ( key, cache, opt ) {
            var values = opt.values
                , digest = getDigest( key, opt )
                , k = null
                , entry = null
                , age = 0
                , stale = {
                    age : -Infinity
                    , key : null
                    , timestamp : -1
                }
                , fresh = cache[ digest ]
                , length = 0
                , tbytes = 0
                ;
            for ( k in cache ) {
                entry = cache[ k ];
                if ( k !== digest ) {
                    entry.age += 1;
                }
                age = entry.age;
                if ( stale.age < age ) {
                    stale.age = age;
                    stale.key = k;
                    stale.timestamp = entry.updateAt;
                } else if ( stale.age === age ) {
                    if ( entry.updatedAt < stale.timestamp ) {
                        stale.key = k;
                        stale.timestamp = entry.updatedAt;
                    }
                }
                tbytes += entry.bytes;
                ++length;
            };
            if ( ! fresh ) {
                fresh = {
                    age : 1
                    , key : key
                    , kdigest : digest
                    , data : null
                    , ddigest : null
                    , bytes : 0
                    , updatedAt : -1
                };
                cache[ digest ] = fresh;
                tbytes += fresh.bytes;
                ++length;
            } 
            fresh.age -= 2;
            fresh.updatedAt = Date.now();
            if ( length > opt.capacity ) {
                tbytes -= cache[ stale.key ].bytes;
                delete( cache[ stale.key ] );
                --length;
            }
            return {
                key : key
                , digest : digest
                , entries : length
                , bytes : tbytes
            };
        }
        // default config
        , camphora_opt = {
            algorithm : 'sha1'
            , output_encoding : 'hex'
            , input_encoding : 'binary'
            , capacity : 1024
        }
        // load file opt
        , file_load_opt = {
            /*
             * For default #load method saves the file data
             * and its digest in the cache.
             */
            payload : true
            /*
             * For default #load method uses the entire file
             * path to generate the digest, if it is set to
             * true, only basename will be used (last portion
             * of the path).
             */
            , basename : false
            /*
             * fs.readFile default options
             */
            , encoding : null
            , flag : 'r'
        }
        // Camphora
        , Camphora = function ( opt ) {
            var me = this
                ;
            if ( ! ( me instanceof Camphora ) ) {
                return new Camphora( opt );
            }
            me.options = improve( opt || {}, camphora_opt );
            me.cache = {};
        }
        , cproto = Camphora.prototype
        ;

    cproto.read = function ( key ) {
        var me = this
            , cfg = me.options
            , cache = me.cache
            , k = toString( key ) !== ostr ? stringify( key ) : key
            , result = updateAge( k, cache, cfg )
            ;
        return cache[ result.digest ];
    };

    cproto.get = function ( key ) {
        var me = this
            ;
        return me.cache[ key ];
    };

    cproto.peek = function ( key ) {
        var me = this
            ;
        return me.cache[ getDigest( key, me.options ) ];
    };

    cproto.update = function ( key, data ) {
        var me = this
            , cfg = me.options
            , cache = me.cache
            , k = toString( key ) !== ostr ? stringify( key ) : key
            , result = updateAge( k, cache, cfg )
            , payload = data || null
            , entry = cache[ result.digest ]
            ;

        if ( ! payload ) return entry;

        if ( isBuffer( payload ) ) {
            entry.data = payload;
            entry.bytes = payload.length;
        } else {
            entry.data = String( payload );
            entry.bytes = bblen( entry.data )
        }
        entry.ddigest = getDigest( entry.data, me.options );
        return entry;
    };

    cproto.delete = function ( key ) {
        var me = this
            , cache = me.cache
            ;
        return cache[ key ] ? delete( cache[ key ] ) : false;
    };

    cproto.evict = function ( key ) {
        var me = this
            , cache = me.cache
            , digest = getDigest( key, me.options )
            ;
        return cache[ digest ] ? delete( cache[ digest ] ) : false;
    };

    cproto.clear = function () {
        var me = this
            , cache = me.cache
            , length = okeys( cache ).length
            ;
        me.cache = {};
        return length;
    };

    cproto.keys = function () {
        var me = this
            ;
        return okeys( me.cache );
    };

    cproto.size = function () {
        var me = this
            , cache = me.cache
            , keys = okeys( cache )
            , bytes = 0
            , k = null
            ;
        for ( k in keys ) {
            bytes += cache[ keys[ k ] ].bytes;
        };
        return [ keys.length, bytes ];
    };

    cproto.load = function ( fpath, opt, cback ) {
        var me = this
            , cache = me.cache
            , entry = null
            , digest = null
            , cfg = improve( opt || {}, file_load_opt )
            , fkey = cfg.basename ? path.basename( fpath ) : fpath
            , next = toString( cback ) === ofun ? cback : emptyFn
            ;
        fs.readFile( fpath, opt, function ( err, data ) {
            if ( err ) return next( err );
            digest = getDigest( data, me.options );
            if ( ! cfg.payload ) {
                entry = cache[ getDigest( fkey, me.options ) ];
                if ( entry ) {
                    // clear entry data
                    entry.data = null;
                    entry.ddigest = null;
                    entry.bytes = 0;
                }
                next( null, me.read( fkey ) );
                return;
            }
            next( null, me.update( fkey, data ) );
        } );
    };

    cproto.reset = function () {
        var me = this
            , cache = me.cache
            , entries = 0
            , k = null
            ;
        for ( k in cache ) {
            cache[ k ].age = -1;
            ++entries;
        };
        return entries;
    };

    return Camphora;
} )();