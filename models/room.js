const mongoose = require( 'mongoose' );

const RoomSchema = new mongoose.Schema( {
    title: { type: String, required: true },
    desc: { type: String, required: false },
    product_id: { type: String, required: false },
    admin_id: { type: String, required: true },
    avatar: { type: String, required: false },
    members: [ { type: String, required: true } ]
}, { timestamps: true } );

RoomSchema.statics.updatableFields = function ( updates )
{
    const allowedUpdates = [ 'title', 'desc' ];
    return Object.keys( updates )
        .filter( key => allowedUpdates.includes( key ) )
        .reduce( ( obj, key ) => ( { ...obj, [ key ]: updates[ key ] } ), {} );
};

module.exports = mongoose.model( 'Room', RoomSchema );
