const { Server } = require( 'socket.io' );
const Message = require( '../../models/message' );

let io;

exports.initWebSocket = ( server ) =>
{
    io = new Server( server, { cors: { origin: '*' } } );

    io.on( 'connection', ( socket ) =>
    {
        console.log( 'New client connected:', socket.id );

        socket.on( 'join_room', ( { room_id } ) =>
        {
            if ( !room_id ) return;

            socket.join( room_id );

            console.log( `Client ${socket.id} joined room ${room_id}` );
        } );

        socket.on( 'send_message', async ( { room_id, sender_id, content } ) =>
        {
            if ( !room_id || !sender_id || !content ) return;

            try
            {
                const message = await Message.create( { room_id, sender_id, content } );

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
