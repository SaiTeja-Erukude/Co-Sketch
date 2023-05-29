// create new room functionality
const createRoomBtn = document.getElementById( 'createRoomBtn' );
createRoomBtn.addEventListener( 'click', () => {
    const roomID = generateRoomID();
    sessionStorage.setItem( 'roomID', roomID );
    window.location.href += roomID;
} );


// join room functionality
const joinRoomBtn = document.getElementById( 'joinRoomBtn' );
joinRoomBtn.addEventListener( 'click', () => {
    const roomID = document.getElementById( 'roomID' ).value;
    if ( roomID ) {
        sessionStorage.setItem( 'roomID', roomID );
        window.location.href += roomID;
    }
} );


// function to generate random room IDs
const generateRoomID = () => {
    const letters = 'abcdefghijklmnopqrstuvwxyz';
    let roomId = '';
    for ( let i = 0; i < 8; i++ ) {
        const randomIndex = Math.floor( Math.random() * letters.length );
        const randomLetter = letters.charAt( randomIndex );
        roomId += randomLetter;
    }
    return roomId;
};