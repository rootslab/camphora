#!/usr/bin/env node

/* 
 * Camphora, #peek and #get test.
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
    , k = null
    ;

log( '- created Camphora cache with options:\n', util.inspect( cache.options, false, 3, true ) );

log( '- read/update %d keys:\n', entries.length, util.inspect( entries, false, 3, true ) );

for ( ; r < entries.length; ++r ) {
    result[ r ] = cache.read( entries[ r ] );
};

log( '- check current ages for inserted entries.' );
assert.ok( result[ 3 ].age === -1 );
assert.ok( result[ 2 ].age === 0 );
assert.ok( result[ 1 ].age === 1 );
assert.ok( result[ 0 ].age === 2 );

for ( ; r; ) {
    --r;
    k = 'key' + r;
    log( '- #peek and #get the same entry ("%s"), check correctness of results.', k );
    assert.deepEqual( cache.peek( k ), cache.get( result[ r ].kdigest ) );
    assert.deepEqual( cache.peek( k ).key, k );
};

log( '- check "age" properties for entries, no modification has taken place.' );
assert.ok( result[ 3 ].age === -1 );
assert.ok( result[ 2 ].age === 0 );
assert.ok( result[ 1 ].age === 1 );
assert.ok( result[ 0 ].age === 2 );
