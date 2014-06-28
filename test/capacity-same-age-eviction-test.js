#!/usr/bin/env node

/* 
 * Camphora, capacity test with entries with the same age, but different updating time,
 * entry with the oldest unix timestamp will be evicted.
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
    result[ r ] = cache.update( entries[ r ] );
};

log( '- current cache length should be :', util.inspect( [ entries.length, 0 ], false, 3, true ) );
assert.deepEqual( cache.size(), [ entries.length, 0 ] );

log( '- update entries with %ds interval.', 0.5 );

setTimeout( function () {
    log( '  > update entry', entries[ r - 1 ] );
    cache.update( entries[ --r ] );
    setTimeout( function () {
        log( '  > update entry', entries[ r - 1 ] );
        cache.update( entries[ --r ] );
        setTimeout( function () {
            log( '  > update entry', entries[ r - 1 ] );
           cache.update( entries[ --r ] );
            setTimeout( function () {
                log( '  > update entry', entries[ r - 1 ] );
                cache.update( entries[ --r ] );
                log( '- reset ages for all inserted entries.' );
                cache.reset();
                log( '- update another element to overtake cache capacity and to force an eviction.' );
                cache.read( 'key4' );
                log( '- check if the oldest "%s" entry was evicted from cache (using unix timestamp).', 'key3' );
                assert.equal( cache.peek( 'key3' ), undefined );
                log( '- size should be:.', util.inspect( [ 4, 0 ], false, 3, true ) );
                assert.ok( cache.size(), [ 4, 0 ] );
            }, 500 );
        }, 500 );
    }, 500 );
}, 500 );