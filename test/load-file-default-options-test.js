#!/usr/bin/env node

/* 
 * Camphora Load Test with Default values
 */

var log = console.log
    , assert = require( 'assert' )
    , crypto = require( 'crypto' )
    , fs = require( 'fs' )
    , util = require( 'util' )
    , Bolgia = require( 'bolgia' )
    , improve = Bolgia.improve
    , ooo = Bolgia.circles
    , ostr = ooo.str
    , toString = Bolgia.toString
    , createHash = crypto.createHash
    , stringify = JSON.stringify
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
        payload : true
        , filepath : null
        , encoding : null
        , flag : 'r'
    }
    , cache = Camphora( camphora_opt )
    /*
     * Generate a digest with the key and options,
     * using the private Camphora methods getKeyDigest 
     * and getDataDigest.
     */
    , getDataDigest = function ( key, cfg ) {
        var algo = cfg.algorithm
            , oenc = cfg.output_encoding
            , ienc = cfg.input_encoding
            , k = toString( key ) !== ostr ? stringify( key ) : key
            , digest = createHash( algo ).update( k, ienc ).digest( oenc )
            ;
        return digest;
    }
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
            , ddigest = null
            ;
        log( '- key for new entry should be: "%s"', kdigest );
        assert.equal( kdigest, entry.kdigest );

        log( '- "entry.key" should contain the entire file path: "%s"', fpath );
        assert.equal( entry.key, fpath );

        log( '- load "%s" filedata to generate digests.', fpath )
        fs.readFile( fpath, file_load_opt, function ( err, data ) {
            if ( err ) throw err;
            ddigest = getDataDigest( data, camphora_opt );
            log( '- comparing data digest with cache entry value.' );
            assert.equal( ddigest, entry.ddigest );
            log( '- age should be refreshed to "%d".', -1 );
            assert.ok( entry.age === -1 );
            log( '- data bytes should be "%d".', data.length );
            assert.equal( data.length, entry.dbytes );
        } );
    }
    , fpath = './index.js'
    , entry = null
    ;

log( '- created Camphora cache with options:\n', util.inspect( camphora_opt, false, 3, true ) );

log( '- load %s file into the cache.', util.inspect( fpath, false, 3, true ) );

cache.load( fpath, file_load_opt, cback );