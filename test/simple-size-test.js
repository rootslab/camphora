#!/usr/bin/env node

/* 
 * Camphora, size test.
 */

var log = console.log
    , assert = require( 'assert' )
    , util = require( 'util' )
    , stringify = JSON.stringify
    , Camphora = require( '../' )
    , entries = [ 'key0', 'key1', 'key2', 'key3', 'key4', 'key5' ]
    , cache = Camphora()
    , result = []
    , r = 0
    , s = 0
    , t = 0
    ;

log( '- created Camphora cache with default options:\n', util.inspect( cache.options, false, 3, true ) );

log( '- update %d keys with some dummy data (buffers):\n', entries.length, util.inspect( entries, false, 3, true ) );

for ( ; r < entries.length; ++r ) {
    s = Math.pow( 2, r + 1 );
    t += s;
    result[ r ] = cache.update( entries[ r ], new Buffer( s ) );
};

log( '- size should be:', util.inspect( [ 4, t ], false, 3, true ) );
assert.ok( cache.size(), [ 4, t ] );

log( '- #delete all entries from the cache, check #size results.' );
for ( ; r; ) {
    t -= Math.pow( 2, r );
    assert.equal( cache.delete( result[ --r ].kdigest ), true );
    assert.deepEqual( cache.size(), [ r, t ] );
};