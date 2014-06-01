/*
 * Camphora, a tiny module for NFU (Not Frequently Used)
 * caching, with linear Aging.
 *
 * Copyright(c) 2014 Guglielmo Ferri <44gatti@gmail.com>
 * MIT Licensed
 */

exports.version = require( '../package' ).version;
exports.Camphora = ( function () {
    var log = console.log
        , crypto = require( 'crypto' )
        , util = require( 'util' )
        , Bolgia = require( 'bolgia' )
        , toString = Bolgia.toString
        , improve = Bolgia.improve
        , ooo = Bolgia.circles
        , ostr = ooo.str
        , okeys = Object.keys
        , min = Math.min
        , bblen = Buffer.byteLength
        , createHash = crypto.createHash
        , stringify = JSON.stringify
        , pow = 1 << 31 >>> 0
        // update cache with a fresh key
        , updateAge = function ( key, cache, opt ) {
            var algo = opt.algorithm
                , ienc = opt.input_encoding
                , oenc = opt.output_encoding
                , values = opt.values
                , capacity = opt.capacity
                , digest = createHash( algo ).update( key, ienc ).digest( oenc )
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
                    , value : ( values ) ? key : null
                    , bytes : ( values ) ? bblen( key, 'utf8' ) : 0
                };
                cache[ digest ] = fresh;
                tbytes += fresh.bytes;
                ++length;
            } 
            --fresh.age;
            if ( length > capacity ) {
                tbytes -= cache[ stale.key ].bytes;
                delete( cache[ stale.key ] );
                --length;
            }
            return [ length, tbytes ];
        }
        // default config
        , camphora_opt = {
            algorithm : 'sha1'
            , output_encoding : 'hex'
            , input_encoding : 'binary'
            , capacity : 1024
            , values : true
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
        , nproto = Camphora.prototype
        ;

    nproto.update = function ( key ) {
        var me = this
            , cfg = me.options
            , cache = me.cache
            , k = toString( key ) !== ostr ? stringify( key ) : key
            ;
        return updateAge( k, cache, cfg );
    };

    nproto.evict = function ( key ) {
        var me = this
            , cache = me.cache
            , k = cache[ key ]
            ;
        return k ? delete( cache[ key ] ) : false;
    };

    nproto.clear = function () {
        var me = this
            , cache = me.cache
            , length = okeys( cache ).length
            ;
        me.cache = {};
        return length;
    };

    nproto.keys = function () {
        var me = this
            , cache = me.cache
            ;
        return okeys( cache );
    };

    nproto.size = function () {
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

    nproto.peek = function ( key ) {
        var me = this
            , cache = me.cache
            , cfg = me.options
            , algo = cfg.algorithm
            , oenc = cfg.output_encoding
            , ienc = cfg.input_encoding
            , k = toString( key ) !== ostr ? stringify( key ) : key
            , digest = createHash( algo ).update( k, ienc ).digest( oenc )
            ;
        return cache[ digest ];
    };

    return Camphora;
} )();