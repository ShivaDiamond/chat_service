const { Server } = require( 'socket.io' );
const Message = require( '../../models/message' );

let io;

exports.initWebSocket = ( server ) =>
{
    io = new Server( server, {
        cors: { origin: '*' },
        pingInterval: 25000, // Ping clients every 25 seconds
        pingTimeout: 60000, // Wait for 60 seconds before considering a client disconnected
        transports: [ 'websocket', 'polling' ] // Ensure fallback for polling
    } );

    io.on( 'connection', ( socket ) =>
    {
        console.log( 'New client connected:', socket.id );

        socket.on( 'join_room', ( { room_id } ) =>
        {
            if ( !room_id ) return;

            socket.join( room_id );

            console.log( `Client ${socket.id} joined room ${room_id}` );
        } );

        socket.on( 'send_message', async ( { room_id, sender_id, content, attachments } ) =>
        {
            if ( !room_id || !sender_id || ( !content && ( !Array.isArray( attachments ) || attachments.length === 0 ) ) ) return;

            try {
                const messageData = { room_id, sender_id, content };
                if ( Array.isArray( attachments ) && attachments.every( att => typeof att === 'string' ) )
                {
                    messageData.attachments = attachments;
                }

                // Create and save the message
                const message = await Message.create( messageData );

                // Broadcast the new message to everyone in the room
                io.to( room_id ).emit( 'new_message', message );

                console.log( `Message sent to room ${room_id}` );
            }
            catch ( error )
            {
                console.error( 'Error saving message:', error );
            }
        } );

        socket.on( 'disconnect', () =>
        {
            console.log( 'Client disconnected:', socket.id );
        } );
    } );
};

exports.getIO = () => io;
