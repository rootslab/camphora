/*
 * Camphora, a tiny module for NFU (Not Frequently Used)
 * in-memory caching, with linear Aging.
 *
 * Copyright(c) 2015 Guglielmo Ferri <44gatti@gmail.com>
 * MIT Licensed
 */

exports.version = require( '../package' ).version;
exports.Camphora = ( function () {
    var crypto = require( 'crypto' )
        , fs = require( 'fs' )
        , Bolgia = require( 'bolgia' )
        , emptyFn = function () {}
        , doString = Bolgia.doString
        , improve = Bolgia.improve
        , clone = Bolgia.clone
        , ooo = Bolgia.circles
        , ostr = ooo.str
        , ofun = ooo.fun
        , okeys = Object.keys
        , isBuffer = Buffer.isBuffer
        , bblen = Buffer.byteLength
        , createHash = crypto.createHash
        , stringify = JSON.stringify
        // produce a digest
        , getDataDigest = function ( key, cfg ) {
            var algo = cfg.algorithm
                , oenc = cfg.output_encoding
                , ienc = cfg.input_encoding
                , k = doString( key ) !== ostr ? stringify( key ) : key
                , digest = createHash( algo ).update( k, ienc ).digest( oenc )
                ;
            return digest;
        }
        , getKeyDigest = function ( key, cfg ) {
            var algo = cfg.algorithm
                , oenc = cfg.output_encoding
                , ienc = cfg.input_encoding
                , k = doString( key ) !== ostr ? stringify( key ) : key
                , digest = cfg.encrypt_keys ? createHash( algo ).update( k, ienc ).digest( oenc ) : k
                ;
            return digest;
        }
        // update cache with a fresh key
        , updateAge = function ( key, cache, opt ) {
            var digest = getKeyDigest( key, opt )
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
                    if ( ( ! stale.timestamp ) || ( entry.updatedAt < stale.timestamp ) ) {
                        stale.key = k;
                        stale.timestamp = entry.updatedAt;
                    }
                }
                tbytes += entry.dbytes;
                ++length;
            }
            if ( ! fresh ) {
                fresh = {
                    age : 1
                    , key : key
                    , kdigest : digest === key ? null : digest
                    , data : null
                    , ddigest : null
                    , dbytes : 0
                    , updatedAt : -1
                };
                cache[ digest ] = fresh;
                tbytes += fresh.dbytes;
                ++length;
            } 
            fresh.age -= 2;
            fresh.updatedAt = Date.now();
            if ( length > opt.capacity ) {
                tbytes -= cache[ stale.key ].dbytes;
                delete( cache[ stale.key ] );
                --length;
            }
            return {
                key : key
                , digest : digest
                , entries : length
                , dbytes : tbytes
            };
        }
        // default config
        , camphora_opt = {
            capacity : 1024
            , algorithm : 'sha1'
            , output_encoding : 'hex'
            , input_encoding : 'binary'
            , encrypt_keys : true
        }
        // load file opt
        , file_load_opt = {
            payload : true
            , filepath : null
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
            me.options = improve( clone( opt || {} ), camphora_opt );
            me.cache = {};
        }
        , cproto = Camphora.prototype
        ;

    cproto.read = function ( key ) {
        var me = this
            , cfg = me.options
            , cache = me.cache
            , k = doString( key ) !== ostr ? stringify( key ) : key
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
        return me.cache[ getKeyDigest( key, me.options ) ];
    };

    cproto.update = function ( key, data ) {
        var me = this
            , cfg = me.options
            , cache = me.cache
            , k = doString( key ) !== ostr ? stringify( key ) : key
            , result = updateAge( k, cache, cfg )
            , payload = data || null
            , entry = cache[ result.digest ]
            ;

        if ( ! payload ) return entry;

        if ( isBuffer( payload ) ) {
            entry.data = payload;
            entry.dbytes = payload.length;
        } else {
            entry.data = String( payload );
            entry.dbytes = bblen( entry.data );
        }
        entry.ddigest = getDataDigest( entry.data, me.options );
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
            , digest = getKeyDigest( key, me.options )
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
            , dbytes = 0
            , k = null
            ;
        for ( k in keys ) {
            dbytes += cache[ keys[ k ] ].dbytes;
        }
        return [ keys.length, dbytes ];
    };

    cproto.load = function ( fname, opt, cback ) {
        var me = this
            , cache = me.cache
            , entry = null
            , digest = null
            , cfg = improve( opt || {}, file_load_opt )
            , fpath = cfg.filepath  ? cfg.filepath  + '/' + fname : fname
            , next = doString( cback ) === ofun ? cback : emptyFn
            ;
        fs.readFile( fpath, cfg, function ( err, data ) {
            if ( err ) return next( err );
            digest = getDataDigest( data, me.options );
            if ( ! cfg.payload ) {
                entry = cache[ getKeyDigest( fname, me.options ) ];
                if ( entry ) {
                    // clear entry data
                    entry.data = null;
                    entry.ddigest = null;
                    entry.dbytes = 0;
                }
                next( null, me.read( fname ) );
                return;
            }
            next( null, me.update( fname, data ) );
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
        }
        return entries;
    };

    return Camphora;
} )();