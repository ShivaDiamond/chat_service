const Room = require( '../models/room' );
const Message = require( '../models/message' );
const redisClient = require( '../config/redis' );
const apiResponse = require( '../utils/helpers/api.response' );
const DmdService = require( '../utils/dmd_service/dmd.service' );

exports.index = async ( req, res ) => {
    try {
        let { page = 1, per_page = 10, profile_id } = req.query;

        page = Math.max( parseInt( page ), 1);
        per_page = Math.max( parseInt( per_page ), 20 );
        const skip = ( page - 1 ) * per_page;

        // Base members filter with the current user
        let membersFilter = [ req.user.id ];

        // If profile_id is provided, include it in the filter
        if ( profile_id ) {
            membersFilter.push( profile_id );
        }

        // Use $all to ensure both ids are present if profile_id is provided
        const query = profile_id
            ? { members: { $all: membersFilter } }
            : { members: { $in: [ req.user.id ] } };

        const rooms = await Room.find( query )
            .sort( { createdAt: -1 } )
            .skip( skip )
            .limit( per_page );

        apiResponse( res, 'success', 'Room has been indexed successfully.', rooms );
    } catch ( error ) {
        apiResponse( res, 'failed', 'Bad request.', error.toString(), 400 );
    }
};

exports.index = async (req, res) => {
    try {
        let { page = 1, per_page = 10, profile_id } = req.query;

        page = Math.max(parseInt(page), 1);
        per_page = Math.max(parseInt(per_page), 20);
        const skip = (page - 1) * per_page;

        // Base members filter with the current user
        let membersFilter = [req.user.id];

        // If profile_id is provided, include it in the filter
        if (profile_id) {
            membersFilter.push(profile_id);
        }

        // Use $all to ensure both ids are present if profile_id is provided
        const query = profile_id
            ? { members: { $all: membersFilter } }
            : { members: { $in: [req.user.id] } };

        const rooms = await Room.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(per_page);

        apiResponse(res, 'success', 'Room has been indexed successfully.', rooms);
    } catch (error) {
        apiResponse(res, 'failed', 'Bad request.', error.toString(), 400);
    }
};

exports.store = async ( req, res ) =>
{
    try
    {
        const uniqueMembers = [ ...new Set( [ req.user.id, ...req.body.members ] ) ];

        const room = await Room.create( {
            title: req.body.title,
            desc: req.body.desc,
            product_id: req.body.product_id,
            admin_id: req.user.id,
            avatar: req.body.avatar,
            members: uniqueMembers
        } );

        apiResponse( res, 'success', 'Room has created successfully.', room );
    }
    catch ( error )
    {
        apiResponse( res, 'failed', 'Bad request.', error.toString(), 400 );
    }
};

exports.getProductRooms = async ( req, res ) =>
{
    try
    {
        let { page = 1, per_page = 10 } = req.query;

        page = Math.max( parseInt( page ), 1 );
        per_page = Math.max( parseInt( per_page ), 20 );
        const skip = ( page - 1 ) * per_page;

        const rooms = await Room.find( {
            members: { $in: [ req.user.id ] },
            product_id: req.params.product_id
        } )
        .sort( { createdAt: -1 } )
        .skip( skip )
        .limit( per_page );

        apiResponse( res, 'success', 'Product rooms has been indexed successfully.', rooms );
    }
    catch ( error )
    {
        apiResponse( res, 'failed', 'Bad request.', error.toString(), 400 );
    }
};

exports.show = async ( req, res ) =>
{
    try
    {
        const room = await Room.findById( req.params.id );
        if ( !room )
        {
            throw new Error( 'Room not found.' );
        }

        apiResponse( res, 'success', 'Room has shown successfully.', room );
    }
    catch ( error )
    {
        apiResponse( res, 'failed', 'Bad request.', error.toString(), 400 );
    }
}

exports.update = async ( req, res ) =>
{
    try
    {
        const data = Room.updatableFields( req.body ); // Automatically filters fields

        const room = await Room.findByIdAndUpdate( req.params.id, data, {
            new: true,
            runValidators: true
        } );

        if ( !room )
        {
            throw new Error( 'Room not found.' );
        }

        apiResponse( res, 'success', 'Room has updated successfully.', room );
    }
    catch ( error ) {
        apiResponse( res, 'failed', 'Bad request.', error.toString(), 400 );
    }
}

exports.delete = async ( req, res ) =>
{
    try
    {
        const room = await Room.findById( req.params.id );
        if ( !room )
        {
            throw new Error( 'Room not found.' );
        }

        if ( room.admin_id !== req.user.id )
        {
            throw new Error( 'Only admin can delete the room.' );
        }

        await Room.findByIdAndDelete( req.params.id );

        apiResponse( res, 'success', 'Room has deleted successfully.', room );
    }
    catch ( error )
    {
        apiResponse( res, 'failed', 'Bad request.', error.toString(), 400 );
    }
}

exports.getMessages = async ( req, res ) =>
{
    try
    {
        const room_id = req.params.id;
        const room = await Room.findById( room_id );
        if ( !room )
        {
            throw new Error( 'Room not found.' );
        }

        if ( !room.members || !room.members.includes( req.user.id ) )
        {
            throw new Error( 'You are not a member of the room.' );
        }

        let { page = 1, per_page = 10 } = req.query;

        page = Math.max( parseInt( page ), 1 );
        per_page = Math.max( parseInt( per_page ), 1 );
        const skip = ( page - 1 ) * per_page;

        const messages = await Message.find( { room_id: room._id } )
            .sort( { createdAt: -1 } )
            .skip( skip )
            .limit( per_page );

        apiResponse( res, 'success', 'Room messages has indexed successfully.', messages );
    }
    catch ( error )
    {
        apiResponse( res, 'failed', 'Bad request.', error.toString(), 400 );
    }
}

exports.getMembers = async ( req, res ) =>
{
    try
    {
        const room_id = req.params.id;
        const room = await Room.findById( room_id );
        if ( !room )
        {
            throw new Error( 'Room not found.' );
        }

        if ( !room.members || !room.members.includes( req.user.id ) )
        {
            throw new Error( 'You are not a member of the room.' );
        }

        // Fetch cached profiles first
        let membersData = [];
        let missingProfiles = [];

        for ( const memberId of room.members )
        {
            let cachedProfile = await redisClient.get( `profile:${memberId}` );
            if ( cachedProfile )
            {
                membersData.push( JSON.parse( cachedProfile ) );
            }
            else
            {
                missingProfiles.push( memberId );
            }
        }

        // Fetch missing profiles in one batch API call
        if ( missingProfiles.length > 0 )
        {
            const fetchedMissingProfiles = await DmdService.indexBatchProfiles( req.token, missingProfiles );
            fetchedMissingProfiles.forEach( profile =>
            {
                redisClient.setex( `profile:${profile.id}`, 3600, JSON.stringify( profile ) ); // Cache for 1 hour
                membersData.push( profile );
            } );
        }

        apiResponse( res, 'success', 'Room members has indexed successfully.', { ...room.toObject(), members: membersData } );
    }
    catch ( error )
    {
        apiResponse( res, 'failed', 'Bad request.', error.toString(), 400 );
    }
}

exports.addMembers = async ( req, res ) =>
{
    try {
        const { member_ids } = req.body; // Accept an array of members
        if ( !Array.isArray( member_ids ) || member_ids.length === 0 )
        {
            throw new Error( 'Invalid member list.' );
        }

        const room_id = req.params.id;
        const room = await Room.findById( room_id );
        if ( !room )
        {
            throw new Error( 'Room not found.' );
        }

        if ( !room.members || !room.members.includes( req.user.id ) )
        {
            throw new Error( 'You are not a member of the room.' );
        }

        // Filter out existing members to avoid duplicates
        const newMembers = member_ids.filter( memberId => !room.members.includes( memberId ) );

        if ( newMembers.length > 0 )
        {
            room.members.push( ...newMembers );
            await room.save();
        }

        apiResponse( res, 'success', 'Members added successfully.', newMembers );
    }
    catch ( error )
    {
        apiResponse( res, 'failed', 'Bad request.', error.toString(), 400 );
    }
};

exports.removeMembers = async ( req, res ) =>
{
    try
    {
        const { member_ids } = req.body; // Accept an array of members
        if ( !Array.isArray( member_ids ) || member_ids.length === 0 )
        {
            throw new Error( 'Invalid member list.' );
        }

        const room_id = req.params.id;
        const room = await Room.findById( room_id );
        if ( !room )
        {
            throw new Error( 'Room not found.' );
        }

        // Only the admin can remove members
        if ( room.admin_id !== req.user.id )
        {
            throw new Error( 'Only admin can remove members.' );
        }

        // Prevent admin from removing themselves
        if ( member_ids.includes( room.admin_id ) )
        {
            throw new Error( 'Admin cannot remove themselves from the room.' );
        }

        // Filter out the members that need to be removed
        const initialMemberCount = room.members.length;
        room.members = room.members.filter( member => !member_ids.includes( member ) );

        // Check if any members were actually removed
        if ( room.members.length === initialMemberCount )
        {
            throw new Error( 'No members were removed. They might not be in the room.' );
        }

        await room.save();

        apiResponse( res, 'success', 'Members removed successfully.', member_ids );

    }
    catch ( error )
    {
        apiResponse( res, 'failed', 'Bad request.', error.toString(), 400 );
    }
};
