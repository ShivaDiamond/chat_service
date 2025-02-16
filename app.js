require( 'dotenv' ).config();

const http = require( 'http' );
const cors = require( 'cors' );
const morgan = require( 'morgan' );
const helmet = require( 'helmet' );
const express = require( 'express' );
const mongoose = require( 'mongoose' );
const roomsRoutes = require( './routes/room.routes' );
const healthRoutes = require( './routes/health.routes' );
const messageRoutes = require( './routes/message.routes' );

const { initWebSocket } = require( './utils/websocket/websocket' );

// Import configurations
const { host, port, mongo_uri } = require( './config' );

// Create an Express app
const app = express();
const server = http.createServer( app );

// Init Web Socket
initWebSocket( server );

// Connect to MongoDB and then start the server
mongoose.connect( mongo_uri )
    .then( () => console.log( 'MongoDB connected' ) )
    .catch( err => console.error( 'MongoDB connection error', err ) );

// Use middlewares
app.use( helmet() );
app.use( morgan( 'dev' ) );
app.use( express.json() );

// Enable CORS with custom options
app.use( cors( {
    origin: '*',
    methods: [ 'GET', 'POST', 'PUT', 'DELETE', 'OPTIONS' ],
    allowedHeaders: [ 'Content-Type', 'Authorization', 'Accept' ],
    credentials: true
} ) );

// Register routes
app.use( '/health', healthRoutes );
app.use( '/api/rooms', roomsRoutes );
app.use( '/api/messages', messageRoutes );

server.listen( port, host, () => {
    console.log( `Server running on ${host}:${port}` );
} );
