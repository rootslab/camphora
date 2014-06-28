#!/usr/bin/env node

/* 
 * Camphora Load Test, don't load file data into the cache,
 * only digest for filepath/key will be stored.
 */

var log = console.log
    , assert = require( 'assert' )
    , crypto = require( 'crypto' )
    , util = require( 'util' )
    , Bolgia = require( 'bolgia' )
    , ooo = Bolgia.circles
    , ostr = ooo.str
    , toString = Bolgia.toString
    , createHash = crypto.createHash
    , Camphora = require( '../' )
    // default config
    , camphora_opt = {
        capacity : 1024
        , algorithm : 'sha1'
        , output_encoding : 'hex'
        , input_encoding : 'binary'
        , encrypt_keys : true
    }
    // file opt for Camphora#load
    , file_load_opt = {
        // don't store file data, use only name/path/key
        payload : false
        , filepath : null
        , encoding : null
        , flag : 'r'
    }
    , cache = Camphora( camphora_opt )
    /*
     * Generate a digest with the key and options,
     * using the private Camphora methods getKeyDigest 
     */
    , getKeyDigest = function ( key, cfg ) {
        var algo = cfg.algorithm
            , oenc = cfg.output_encoding
            , ienc = cfg.input_encoding
            , k = toString( key ) !== ostr ? stringify( key ) : key
            , digest = cfg.encrypt_keys ? createHash( algo ).update( k, ienc ).digest( oenc ) : k
            ;
        return digest;
    }
    // command callback
    , cback = function ( err, entry ) {
        if ( err ) throw err;
        var kdigest = getKeyDigest( fpath, camphora_opt )
            ;
        log( '- key for new entry should be: "%s"', kdigest );
        assert.equal( kdigest, entry.kdigest );

        log( '- data should be "%s".', null );
        assert.equal( null, entry.data );

        log( '- data digest should be "%s".', null );
        assert.equal( null, entry.ddigest );

        log( '- data bytes should be "%d".', 0 );
        assert.equal( 0, entry.dbytes );
    }
    , fpath = './index.js'
    , entry = null
    ;

log( '- created Camphora cache with options:\n', util.inspect( camphora_opt, false, 3, true ) );

log( '- load %s file into the cache.', util.inspect( fpath, false, 3, true ) );

cache.load( fpath, file_load_opt, cback );