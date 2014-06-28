#!/usr/bin/env node

/* 
 * Camphora, stringify a Key
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

log( '- created Camphora cache with default options.' );

log( '- read/update a key, argument is not a string:', util.inspect( entry, false, 2, true ) );
result = cache.read( entry );
log( '- #read result:', util.inspect( result, false, 2, true ) );

log( '- check #read result key is equal to JSON.stringify:', util.inspect( result, false, 2, true ) );
assert.ok( result.key === JSON.stringify( entry ) );

log( '- peek a key, argument is not a string:', util.inspect( entry, false, 2, true ) );
result = cache.peek( entry );
log( '- #peek result:', util.inspect( result, false, 2, true ) );

log( '- check #peek result key is equal to JSON.stringify:', util.inspect( result, false, 2, true ) );
assert.ok( result.key === JSON.stringify( entry ) );

log( '- update a key, argument is not a string:', util.inspect( entry, false, 2, true ) );
result = cache.update( entry );
log( '- #update result:', util.inspect( result, false, 2, true ) );

log( '- check #update result key is equal to JSON.stringify:', util.inspect( result, false, 2, true ) );
assert.ok( result.key === JSON.stringify( entry ) );

log( '- evict a key, argument is not a string:', util.inspect( entry, false, 2, true ) );
result = cache.evict( entry );
log( '- #evict result:', util.inspect( result, false, 2, true ) );

log( '- check if cache is empty:', util.inspect( cache.cache, false, 2, true ) );
assert.ok( Object.keys( cache.cache ).length === 0 );

log( '- check #size result, should be:', util.inspect( [ 0, 0 ], false, 2, true ) );
assert.deepEqual( cache.size(), [ 0, 0 ] );