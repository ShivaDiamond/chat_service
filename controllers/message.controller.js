const Message = require( '../models/message' );
const websocket = require( '../utils/websocket/websocket' );
const apiResponse = require( '../utils/helpers/api.response' );

exports.index = async ( req, res ) => {
    try
    {
        let { page = 1, perPage = 10, ...filters } = req.query;

        page = Math.max( parseInt( page ), 1 );
        perPage = Math.max( parseInt( perPage ), 1 );
        const skip = ( page - 1 ) * perPage;

        // Construct filter object dynamically
        let filter = {};
        for ( const key in filters )
        {
            if ( filters[ key ] )
            {
                filter[ key ] = filters[ key ];
            }
        }

        const messages = await Message.find( filter )
            .skip( skip )
            .limit( perPage );

        const totalItems = await Message.countDocuments( filter );
        const totalPages = Math.ceil( totalItems / perPage );

        apiResponse( res, 'success', 'Message has been indexed successfully.', {
            items: messages,
            page: page,
            perPage: perPage,
            totalPages: totalPages,
            totalItems: totalItems,
        } );
    }
    catch ( error ) {
        apiResponse( res, 'failed', 'Bad request.', error.toString(), 400 );
    }
};

exports.show = async ( req, res ) => {
    try {
        const message = await Message.findById( req.params.id );
        if ( !message )
        {
            throw new Error( 'Message not found.' );
        }

        apiResponse( res, 'success', 'Message has shown successfully.', message );
    }
    catch ( error ) {
        apiResponse( res, 'failed', 'Bad request.', error.toString(), 400 );
    }
}

exports.update = async ( req, res ) => {
    try {
        const message = await Message.findById( req.params.id );
        if ( !message )
        {
            throw new Error( 'Message not found.' );
        }

        // Check if the sender is the same as the requesting user
        if ( message.sender_id !== req.user.id )
        {
            throw new Error( 'Unauthorized.' );
        }

        const updatedMessage = await Message.findByIdAndUpdate( req.params.id, req.body, {
            new: true,
            runValidators: true
        } );

        // Notify users via WebSocket
        const io = websocket.getIO();
        io.to( message.room_id.toString() ).emit( 'edit_message', updatedMessage );

        apiResponse( res, 'success', 'Message has updated successfully.', updatedMessage );
    }
    catch ( error ) {
        apiResponse( res, 'failed', 'Bad request.', error.toString(), 400 );
    }
}

exports.delete = async ( req, res ) => {
    try {
        const message = await Message.findById( req.params.id );
        if ( !message )
        {
            throw new Error( 'Message not found.' );
        }

        // Check if the sender is the same as the requesting user
        if ( message.sender_id !== req.user.id )
        {
            throw new Error( 'Unauthorized.' );
        }

        const deletedMessage = await Message.findByIdAndDelete( req.params.id );

        // Notify users via WebSocket
        const io = websocket.getIO();
        io.to( message.room_id.toString() ).emit( 'delete_message', deletedMessage.id );

        apiResponse( res, 'success', 'Message has deleted successfully.', deletedMessage );
    }
    catch ( error ) {
        apiResponse( res, 'failed', 'Bad request.', error.toString(), 400 );
    }
}
