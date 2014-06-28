#!/usr/bin/env node

/* 
 * Camphora Load Test, using filepath
 */

var log = console.log
    , assert = require( 'assert' )
    , util = require( 'util' )
    , Camphora = require( '../' )
    // default config
    , camphora_opt = {
        capacity : 1024
        , algorithm : 'sha1'
        , output_encoding : 'hex'
        , input_encoding : 'binary'
        // encryption off
        , encrypt_keys : false
    }
    // file opt for Camphora#load
    , file_load_opt = {
        payload : true
        , filepath : './'
        , encoding : null
        , flag : 'r'
    }
    , cache = Camphora( camphora_opt )

    // command callback
    , cback = function ( err, entry ) {
        if ( err ) throw err;
        log( '- ok, file "./%s" loaded', fname );
        log( '- key for new entry should not be encrypted: "%s"', entry.key );
        assert.equal( cache.cache[ entry.key ].key, entry.key );
        log( '- key digest should be "%s".', null );
        assert.equal( null, entry.kdigest );
    }
    , fname = 'index.js'
    , entry = null
    ;

log( '- created Camphora cache with options:\n', util.inspect( camphora_opt, false, 3, true ) );

log( '- load %s file, from %s path, into the cache.', util.inspect( fname, false, 3, true ), util.inspect( './', false, 3, true ) );

cache.load( fname, file_load_opt, cback );