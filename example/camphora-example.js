var log = console.log
    , util = require( 'util' )
    , Camphora = require( '../' )
    , cache = Camphora( {
        algorithm : 'sha1'
        , input_encoding : 'binary'
        , output_encoding : 'hex'
        , capacity : 4
        , values : true
    } )
    , size = -1
    , entry0 = { prop0 : 'value0' }
    ;

cache.update( entry0 );
cache.update( { prop1 : 'value1' } );
cache.update( entry0 );
cache.update( { prop2: 'value2' } );
cache.update( { prop3: 'value3' } );
log( cache.update( entry0 ) );

log( '- current Camphora istance:\n', util.inspect( cache, false, 2, true ) );

size = cache.size();

log( '- cache entries: %d.', size[ 0 ] );
log( '- cache size (values): %d bytes.', size[ 1 ] );

log( '- peek "%j":', entry0, util.inspect( cache.peek( entry0 ), false, 2, true ) );

log( '- delete "%j":', entry0, cache.evict( entry0 ) );

log( ' current cache:', util.inspect( cache, false, 2, true ) );


log( '- reset age properties for %d entries.', cache.reset() );
log( util.inspect( cache, false, 2, true ) );