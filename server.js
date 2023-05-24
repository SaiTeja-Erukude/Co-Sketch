let express = require( 'express' );
let app = express();
let httpServer = require( 'http' ).createServer( app );
let io = require( 'socket.io' )( httpServer );

let connections = [];

io.on( 'connect', ( socket ) => {
    connections.push( socket );
    console.log( `${ socket.id } has connected!` );

    // sending x, y, color data to other connections
    socket.on( 'draw', ( data ) => {
        connections.forEach( con => {
            if ( con.id !== socket.id ) {
                con.emit( 'ondraw', { x: data.x, y: data.y, size: data.size, color: data.color } );
            }
        } );
    } );

    socket.on( 'down', ( data ) => {
        connections.forEach( con => {
            if ( con.id !== socket.id ) {
                con.emit( 'ondown', { x: data.x, y: data.y } );
            }
        } );
    } );

    socket.on( 'clear', () => {
        connections.forEach( con => {
            con.emit( 'onclear' );
        } );
    } );

    socket.on( 'disconnect', () => {
        connections = connections.filter( con => con.id !== socket.id );
        console.log( `${ socket.id } has disconnected!` );
    } );
} );

app.use( express.static( 'public' ) );

let PORT = process.env.PORT || 5000;

httpServer.listen( PORT, () => {
    console.log( `Listening on port ${ PORT }` );
} );