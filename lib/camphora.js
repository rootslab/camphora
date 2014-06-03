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
        , Bolgia = require( 'bolgia' )
        , toString = Bolgia.toString
        , improve = Bolgia.improve
        , ooo = Bolgia.circles
        , ostr = ooo.str
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
                    key : null
                    , age : 0
                }
                , fresh = cache[ digest ]
                , length = 0
                , tbytes = 0
                ;
            for ( k in cache ) {
                entry = cache[ k ];
                if ( k !== digest ) {
                    entry.age += 2;
                }
                age = entry.age;
                if ( stale.age < age ) {
                    stale.age = age;
                    stale.key = k;
                }
                tbytes += entry.bytes;
                ++length;
            };
            if ( ! fresh ) {
                fresh = {
                    age : 0
                    , key : key
                    , kdigest : digest
                    , data : null
                    , ddigest : null
                    , bytes : 0
                };
                cache[ digest ] = fresh;
                tbytes += fresh.bytes;
                ++length;
            } 
            --fresh.age;
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
        // Camphora
        , Camphora = function ( opt ) {
            var me = this
                ;
            if ( ! ( me instanceof Camphora ) ) {
                return new Camphora( opt );
            }
            me.options = improve( opt, camphora_opt );
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
            , digest = null
            , next = toString( cback ) === ooo.fun ? cback : function () {}
            ;
        fs.readFile( fpath, opt, function ( err, data ) {
            if ( err ) return next( err );
            digest = getDigest( data, me.options );
            next( null, me.update( fpath, data ) );
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