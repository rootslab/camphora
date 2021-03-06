 var log = console.log
    , util = require( 'util' )
    , Camphora = require( '../' )
    , cache = Camphora()
    , cback = function ( err, data ) {
        if ( err ) {
            log( err );
            return;
        }
        log( '- new entry is:\n', util.inspect( data, false, 2, true ), '\n' );
    }
    , fpath = './index.js'
    ;

log( '\n- load "%s" file into the cache.', fpath );

cache.load( fpath, null, cback );