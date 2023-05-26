let canvas = document.getElementById( 'canvas' );
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let ctx = canvas.getContext( '2d' );

var io = io.connect( 'http://localhost:5000' );

let x;
let y;
let mouseDown;
let color = sessionStorage.getItem( 'color' ) || '#000000';
let size = sessionStorage.getItem( 'size' ) || 5;


// change event for color picker
let colorPicker = document.getElementById( 'colorPicker' );
colorPicker.addEventListener( 'change', () => {
    color = colorPicker.value;
    sessionStorage.setItem( 'color', color );

} );


// change event for size dropdown
let sizeDropdown = document.getElementById( 'sizeDropdown' );
sizeDropdown.addEventListener( 'change', () => {
    size = sizeDropdown.value;
    sessionStorage.setItem( 'size', size );
} );


// retrieve from session if already exists
colorPicker.value = sessionStorage.getItem( 'color' ) || '#000000';
sizeDropdown.value = sessionStorage.getItem( 'size' ) || 5;


// retrieve data from other connections
io.on( 'ondraw', ( { x, y, size, color } ) => {
    ctx.lineTo( x, y );
    ctx.lineWidth = size;
    ctx.strokeStyle = color;
    ctx.stroke();
} );

io.on( 'ondown', ( { x, y } ) => {
    ctx.beginPath();
    ctx.moveTo( x, y );

} );

io.on( 'onclear', () => {
    ctx.clearRect( 0, 0, canvas.width, canvas.height );
    sessionStorage.setItem( 'savedCanvasData', null );
} );

window.onmousedown = ( e ) => {
    ctx.beginPath();
    ctx.moveTo( x, y );
    io.emit( 'down', ( { x, y } ) );
    mouseDown = true;
};

window.onmouseup = ( e ) => {
    mouseDown = false;
};

window.onmousemove = ( e ) => {
    x = e.clientX;
    y = e.clientY - 50;
    if ( mouseDown ) {
        // send data to the server
        io.emit( 'draw', { x, y, size, color } );
        console.log( size, color );
        ctx.lineWidth = size;
        ctx.strokeStyle = color;
        ctx.lineTo( x, y );
        ctx.stroke();
    }
};


// Retrieve saved canvas data from sessionStorage
let savedCanvasData = sessionStorage.getItem( 'savedCanvasData' );

// If saved data exists, restore the canvas
if ( savedCanvasData ) {
    let img = new Image();
    img.onload = function () {
        ctx.drawImage( img, 0, 0 );
    };
    img.src = savedCanvasData;
}

// Handle page unload event to save the canvas, size and color
window.addEventListener( 'beforeunload', function () {
    let canvasData = canvas.toDataURL();
    sessionStorage.setItem( 'savedCanvasData', canvasData );
} );


// Clear the canvas
let clearBtn = document.getElementById( 'clearBtn' );
clearBtn.addEventListener( 'click', () => {
    io.emit( 'clear' );
} );