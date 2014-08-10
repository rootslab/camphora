#!/usr/bin/env node

/* 
 * Camphora, clear test.
 */

var log = console.log
    , assert = require( 'assert' )
    , util = require( 'util' )
    , stringify = JSON.stringify
    , Camphora = require( '../' )
    , entries = [ 'key0', 'key1', 'key2', 'key3' ]
    , cache = Camphora()
    , result = []
    , r = 0
    ;

log( '- created Camphora cache with default options:\n', util.inspect( cache.options, false, 3, true ) );

log( '- read/update %d keys:\n', entries.length, util.inspect( entries, false, 3, true ) );

for ( ; r < entries.length; ++r ) {
    result[ r ] = cache.read( entries[ r ] );
};

log( '- size should be:', util.inspect( [ 4, 0 ], false, 3, true ) );
assert.ok( cache.size(), [ 4, 0 ] );

log( '- check #keys result, it should be:', util.inspect( Object.keys( cache.cache ), false, 3, true ) );
assert.deepEqual( cache.keys(), Object.keys( cache.cache ), 'worng #kwys result, got: ' + util.inspect( cache.keys(), false, 3, true ) );

log( '- #clear the cache.' );
r = cache.clear();

log( '- the returning value of #clear should be "%d".', 4 );
assert.ok( r === 4 );

log( '- size should be: "%d".', util.inspect( [ 0, 0 ], false, 3, true ) );
assert.ok( cache.size(), [ 0, 0 ] );