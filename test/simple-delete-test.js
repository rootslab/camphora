#!/usr/bin/env node

/* 
 * Camphora, delete test.
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

log( '- #delete all entries from the cache, check returning value, should be always: "%s".', true );
for ( ; r; ) {
    assert.equal( cache.delete( result[ --r ].kdigest ), true );
};

log( '- size should be: ', util.inspect( [ 0, 0 ], false, 3, true ) );
assert.ok( cache.size(), [ 0, 0 ] );