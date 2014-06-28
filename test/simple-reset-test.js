#!/usr/bin/env node

/* 
 * Camphora, reset test.
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

log( '- check current ages for inserted entries.' );
assert.ok( result[ 3 ].age === -1 );
assert.ok( result[ 2 ].age === 0 );
assert.ok( result[ 1 ].age === 1 );
assert.ok( result[ 0 ].age === 2 );

log( '- #reset ages for all entries.' );
r = cache.reset();

log( '- the returning value of #reset should be: "%d".', 4 );
assert.ok( r === 4 );

log( '- check current ages for cache entries, should be: "%d".', -1 );
assert.ok( cache.peek( 'key0' ).age ===  -1 );
assert.ok( cache.peek( 'key1' ).age === -1 );
assert.ok( cache.peek( 'key2' ).age === -1 );
assert.ok( cache.peek( 'key3' ).age === -1 );