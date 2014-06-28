#!/usr/bin/env node

/* 
 * Camphora, change encoding algorithm.
 */

var log = console.log
    , assert = require( 'assert' )
    , util = require( 'util' )
    , stringify = JSON.stringify
    , Camphora = require( '../' )
    , cache = Camphora()
    , entry = { id : 13, data : new Buffer( 'data' ) }
    , result = null
    ;

log( '- created Camphora cache with default options:', util.inspect( cache.options, false, 3, true ) );

log( '- read/update key:', util.inspect( entry, false, 2, true ) );
result = cache.read( entry );
log( '- #read result:', util.inspect( result, false, 2, true ) );

log( '- changing algorithm from "%s" to "%s"', cache.options.algorithm, 'md5' );
cache.options.algorithm = 'md5';

log( '- read/update key:', util.inspect( entry, false, 2, true ) );
result = cache.read( entry );
log( '- #read result:', util.inspect( result, false, 2, true ) );

log( '- changing algorithm from "%s" to "%s"', cache.options.algorithm, 'sha256' );
cache.options.algorithm = 'sha256';

log( '- read/update key:', util.inspect( entry, false, 2, true ) );
result = cache.read( entry );
log( '- #read result:', util.inspect( result, false, 2, true ) );

log( '- check #size result, should be:', util.inspect( [ 3, 0 ], false, 3, true ) );
assert.ok( cache.size(), [ 3, 0 ] );