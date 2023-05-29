const canvas = document.getElementById( 'canvas' );
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const ctx = canvas.getContext( '2d' );

const hostURL = 'http://localhost:5000';
var io = io.connect( hostURL );

let x;
let y;
let mouseDown;
let color = sessionStorage.getItem( 'color' ) || '#000000';
let size = sessionStorage.getItem( 'size' ) || 5;
let currRoomID;


// logic to display room ID
window.addEventListener( 'load', () => {
    const canvasRoomID = document.getElementById( 'canvasRoomID' );
    currRoomID = sessionStorage.getItem( 'roomID' );
    if ( currRoomID ) {
        canvasRoomID.innerHTML = 'Room ID: ' + currRoomID;
    }
} );


// change event for color picker
const colorPicker = document.getElementById( 'colorPicker' );
colorPicker.addEventListener( 'change', () => {
    color = colorPicker.value;
    sessionStorage.setItem( 'color', color );
} );


// change event for size dropdown
const sizeDropdown = document.getElementById( 'sizeDropdown' );
sizeDropdown.addEventListener( 'change', () => {
    size = sizeDropdown.value;
    sessionStorage.setItem( 'size', size );
} );


// retrieve from session if already exists
colorPicker.value = sessionStorage.getItem( 'color' ) || '#000000';
sizeDropdown.value = sessionStorage.getItem( 'size' ) || 5;


// retrieve data from other connections (io server)
io.on( 'ondraw', ( { x, y, size, color, roomID } ) => {
    if ( currRoomID === roomID ) {
        ctx.lineTo( x, y );
        ctx.lineWidth = size;
        ctx.strokeStyle = color;
        ctx.stroke();
    }
} );

io.on( 'ondown', ( { x, y, roomID } ) => {
    if ( currRoomID === roomID ) {
        ctx.beginPath();
        ctx.moveTo( x, y );
    }
} );

io.on( 'onclear', ( { roomID } ) => {
    if ( currRoomID === roomID ) {
        ctx.clearRect( 0, 0, canvas.width, canvas.height );
        sessionStorage.setItem( 'savedCanvasData', null );
    }
} );


// draw and send current window data to io server
window.onmousedown = ( e ) => {
    ctx.beginPath();
    ctx.moveTo( x, y );
    io.emit( 'down', ( { x, y, roomID: currRoomID } ) );
    mouseDown = true;
};

window.onmouseup = ( e ) => {
    mouseDown = false;
};

window.onmousemove = ( e ) => {
    x = e.clientX;
    y = e.clientY - 50;
    if ( mouseDown ) {
        // send data to io server
        io.emit( 'draw', { x, y, size, color, roomID: currRoomID } );
        ctx.lineWidth = size;
        ctx.strokeStyle = color;
        ctx.lineTo( x, y );
        ctx.stroke();
    }
};


// Retrieve saved canvas data from sessionStorage
const savedCanvasData = sessionStorage.getItem( 'savedCanvasData' );

// If saved data exists, restore the canvas
if ( savedCanvasData ) {
    const img = new Image();
    img.onload = function () {
        ctx.drawImage( img, 0, 0 );
    };
    img.src = savedCanvasData;
}

// Handle page unload event to save the canvas, size and color
window.addEventListener( 'beforeunload', function () {
    const canvasData = canvas.toDataURL();
    sessionStorage.setItem( 'savedCanvasData', canvasData );
} );


// Clear the canvas
const clearBtn = document.getElementById( 'clearBtn' );
clearBtn.addEventListener( 'click', () => {
    io.emit( 'clear', { roomID: currRoomID } );
} );