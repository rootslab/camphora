#!/usr/bin/env node

/* 
 * Camphora, capacity test.
 */

var log = console.log
    , assert = require( 'assert' )
    , util = require( 'util' )
    , stringify = JSON.stringify
    , Camphora = require( '../' )
    , entries = [ 'key0', 'key1', 'key2', 'key3' ] 
    , cache = Camphora( {
        capacity : entries.length
    } )
    , result = []
    , r = 0
    ;

log( '- created Camphora cache with options:\n', util.inspect( cache.options, false, 3, true ) );

log( '- read/update %d keys:\n', entries.length, util.inspect( entries, false, 3, true ) );

for ( ; r < entries.length; ++r ) {
    result[ r ] = cache.read( entries[ r ] );
};

log( '- current cache length should be :', util.inspect( [ entries.length, 0 ], false, 3, true ) );
assert.deepEqual( cache.size(), [ entries.length, 0 ] );

log( '- check current ages for inserted entries.' );
assert.ok( result[ 3 ].age === -1 );
assert.ok( result[ 2 ].age === 0 );
assert.ok( result[ 1 ].age === 1 );
assert.ok( result[ 0 ].age === 2 );

log( '- push another element to overtake cache capacity and to force an eviction.' );
result[ r ] = cache.read( 'key4' );

log( '- check if the "oldest" entry was evicted from cache,' );
assert.equal( cache.peek( 'key0' ), undefined );
log( '- size should be:.', util.inspect( [ 4, 0 ], false, 3, true ) );
assert.ok( cache.size(), [ 4, 0 ] );

log( '- check current ages for cache entries.' );
assert.ok( cache.peek( 'key1' ).age ===  2 );
assert.ok( cache.peek( 'key2' ).age === 1 );
assert.ok( cache.peek( 'key3' ).age === 0 );
assert.ok( cache.peek( 'key4' ).age === -1 );