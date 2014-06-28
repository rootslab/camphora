#!/usr/bin/env node

/* 
 * Camphora Load Test, don't encrypt keys.
 */

var log = console.log
    , assert = require( 'assert' )
    , fs = require( 'fs' )
    , util = require( 'util' )
    , Camphora = require( '../' )
    // default config
    , camphora_opt = {
        capacity : 1024
        , algorithm : 'sha1'
        , output_encoding : 'hex'
        , input_encoding : 'binary'
        , encrypt_keys : false
    }
    // file opt for Camphora#load
    , file_load_opt = {
        payload : true
        , filepath : null
        , encoding : null
        , flag : 'r'
    }
    , cache = Camphora( camphora_opt )

    // command callback
    , cback = function ( err, entry ) {
        if ( err ) throw err;
        log( '- key for new entry should not be encrypted: "%s"', entry.key );
        assert.equal( cache.cache[ entry.key ].key, entry.key );
        log( '- key digest should be "%s".', null );
        assert.equal( null, entry.kdigest );
    }
    , fpath = './index.js'
    , entry = null
    ;

log( '- created Camphora cache with options:\n', util.inspect( camphora_opt, false, 3, true ) );

log( '- load %s file into the cache.', util.inspect( fpath, false, 3, true ) );

cache.load( fpath, file_load_opt, cback );