const Message = require( '../models/message' );
const websocket = require( '../utils/websocket/websocket' );
const apiResponse = require( '../utils/helpers/api.response' );

exports.index = async ( req, res ) => {
    try {
        // Extract pagination parameters from query string
        let { page = 1, perPage = 10 } = req.query;

        // Convert to integers and ensure valid numbers
        page = Math.max( parseInt( page ), 1 ); // Ensure page is at least 1
        perPage = Math.max( parseInt( perPage ), 1 ); // Ensure limit is at least 1

        // Calculate how many documents to skip
        const skip = ( page - 1 ) * perPage;

        // Fetch paginated messages
        const messages = await Message.find()
            .skip( skip )
            .limit( perPage );

        // Count total documents (for pagination info)
        const totalItems = await Message.countDocuments();

        // Calculate total pages
        const totalPages = Math.ceil( totalItems / perPage );

        apiResponse( res, 'success', 'Message has indexed successfully.', {
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
        const message = await Message.findByIdAndUpdate( req.params.id, req.body, {
            new: true,
            runValidators: true // Enables schema validation on update
        } );

        if ( !message )
        {
            throw new Error( 'Message not found.' );
        }

        // Notify users via WebSocket
        const io = websocket.getIO();
        io.to( message.room_id ).emit( 'edit-message', message );

        apiResponse( res, 'success', 'Message has updated successfully.', message );
    }
    catch ( error ) {
        apiResponse( res, 'failed', 'Bad request.', error.toString(), 400 );
    }
}

exports.delete = async ( req, res ) => {
    try {
        const message = await Message.findByIdAndDelete( req.params.id );
        if ( !message )
        {
            throw new Error( 'Message not found.' );
        }

        // Notify users via WebSocket
        const io = websocket.getIO();
        io.to( message.room_id ).emit( 'delete-message', message.id );

        apiResponse( res, 'success', 'Message has deleted successfully.', message );
    }
    catch ( error ) {
        apiResponse( res, 'failed', 'Bad request.', error.toString(), 400 );
    }
}
