const path = require( 'path' );

const express = require( 'express' );
const app = express();

const httpServer = require( 'http' ).createServer( app );
const io = require( 'socket.io' )( httpServer );

require( 'dotenv' ).config();

const PORT = process.env.PORT;
const shortid = require( 'shortid' );

app.use( express.static( 'public' ) );

let connections = [];
let roomID;

io.on( 'connect', ( socket ) => {
    // if there is no roomID, generate a random one
    if ( !roomID ) {
        roomID = shortid();
    }
    const connection = {
        roomID,
        socket
    };
    connections.push( connection );
    console.log( `${ socket.id } has joined ${ roomID }!` );

    // sending x, y, color, roomID data to other connections
    socket.on( 'draw', ( data ) => {
        connections.forEach( con => {
            if ( con.socket.id !== socket.id ) {
                con.socket.emit( 'ondraw', {
                    x: data.x,
                    y: data.y,
                    size: data.size,
                    color: data.color,
                    roomID: data.roomID
                } );
            }
        } );
    } );

    socket.on( 'down', ( data ) => {
        connections.forEach( con => {
            if ( con.socket.id !== socket.id ) {
                con.socket.emit( 'ondown', {
                    x: data.x,
                    y: data.y,
                    roomID: data.roomID
                } );
            }
        } );
    } );

    socket.on( 'clear', ( data ) => {
        connections.forEach( con => {
            con.socket.emit( 'onclear', {
                roomID: data.roomID
            } );
        } );
    } );

    socket.on( 'disconnect', () => {
        connections = connections.filter( con => con.socket.id !== socket.id );
        console.log( `${ socket.id } left ${ roomID }!` );
    } );
} );


app.get( '/:roomID', ( req, res ) => {
    roomID = req.params.roomID;
    res.sendFile( path.join( __dirname, '/public/canvas.html' ) );
} );


httpServer.listen( PORT, () => {
    console.log( `Listening on port ${ PORT }` );
} );